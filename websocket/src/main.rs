mod communicator;

mod communicators;
use commands::{ClientCommand, ServerCommand};
use communicators::csgo::{CSGORcon};

mod commands;
mod server;
mod state;

extern crate rcon;
extern crate base64;

use base64::{encode, decode};
use server::Server;
use state::{Client, State};

use std::str;
use std::sync::{Arc};
use std::sync::atomic::{Ordering};

#[macro_use]
extern crate lazy_static;

use rand::random;

use futures_util::{future, pin_mut, stream::TryStreamExt, SinkExt, StreamExt, Stream};
use log::*;
use std::net::SocketAddr;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{RwLock, Mutex};
use tokio_tungstenite::{accept_async, tungstenite::Error};
use tungstenite::{Result, Message};
use serde_json::Value;

use futures_channel::mpsc::{unbounded};
use crate::commands::process_command;
use uuid::Uuid;
use std::path::Path;
use std::fs::File;
use std::io::Write;
use std::task::Poll;

use jwt::VerifyWithKey;
use hmac::{Hmac, NewMac};
use sha2::Sha256;
use std::collections::BTreeMap;

async fn accept_connection(peer: SocketAddr, stream: TcpStream, state: Arc<RwLock<State>>) {
    if let Err(e) = handle_connection(peer, stream, state).await {
        match e {
            Error::ConnectionClosed | Error::Protocol(_) | Error::Utf8 => (),
            err => error!("Error processing connection: {:?}", err),
        }
    }
}

fn encode_cmd(cmd: &ServerCommand) -> Vec<u8> {
    Vec::from(encode(serde_json::to_string(cmd).unwrap()).as_bytes())
}

lazy_static! {
    static ref JWT_KEY: String = Uuid::new_v4().to_string();
}

async fn handle_connection(peer: SocketAddr, stream: TcpStream, state: Arc<RwLock<State>>) -> Result<()> {
    let mut ws_stream = accept_async(stream).await.expect("Failed to accept");

    info!("New WebSocket connection: {}", peer);

    // Use an unbounded channel to handle buffering and flushing of messages
    // to the websocket...
    let (tx, rx) = unbounded();
    let name;
    loop {
        if let Some(Ok(msg)) = ws_stream.next().await {
            if msg.is_text() {
                let key: Hmac<Sha256> = Hmac::new_from_slice(JWT_KEY.as_ref()).unwrap();
                match msg.to_text().unwrap().verify_with_key(&key) {
                    Ok(claims) => {
                        let claims: BTreeMap<String,Value> = claims;
                        if let Some(s) = claims.get("sub") {
                            if let Some(sub) = s.as_str() {
                                name = sub.to_string();
                                break; // TODO: check more things about this jwt
                            }
                        }
                    },
                    Err(err) => {
                        info!("auth failed: {}", err);
                    },
                }
                info!("attempted auth with {}", msg);
            }
        }
    }

    let (mut outgoing, incoming) = ws_stream.split();

    let client = Client {
        uuid: uuid::Uuid::new_v4(),
        name,
        hue: random(),
        sender: tx.clone(),
        server: None,
    };
    // let mut state_w = ;
    state.write().await.clients.insert(client.uuid, client.clone());
    state.read().await.count.fetch_add(1, Ordering::Relaxed);

    outgoing.send(Message::from(encode_cmd(
        &ServerCommand::Identity(client.clone())
    ))).await?;

    // TODO: bring back client join broadcasts
    // let mut info = server.info();
    // info.clients = serde_json::to_value(&state.read().await.clients).unwrap();
    // for other in state.read().await.clients.values() {
    //     if other.uuid == client.uuid {
    //         continue;
    //     }
        
    //     other.sender.unbounded_send(Message::from(encode_cmd(
    //         &ServerCommand::Status(info.clone())
    //     ))).unwrap();
    // }

    // let state_cell = Arc::new(Mutex::new(state));
    let tx = Arc::new(Mutex::new(tx.clone()));
    
    // TODO: auth
    let process_incoming = incoming.try_for_each(|msg| async {
        // let state_lock = state_cell.lock().await;
        // let s = state.write().await;
        // let tx_lock = tx_cell.lock().await;
        // TODO: commands can be separated for better organization, code reuse, error handling, etc
        match msg {
            Message::Text(_) => {},
            Message::Binary(bin) => {
                let json = str::from_utf8(&bin).unwrap();
                let json = decode(json).unwrap();
                let json_str = str::from_utf8(&json).unwrap();
                let json = serde_json::from_str::<ClientCommand>(json_str);

                match json {
                    Ok(cmd) => {
                        if let Some(resp) = process_command(cmd, &client.uuid, state.as_ref()).await {
                            // commands can return tungstenite::Message's to send back to the client
                            tx.lock().await.unbounded_send(resp).unwrap();
                        }
                    },
                    Err(err) => {
                        tx.lock().await.unbounded_send(Message::from(encode_cmd(
                            &ServerCommand::Print("Unknown command".to_string())
                        ))).unwrap();
                        warn!("Could not resolve ClientCommand:");
                        warn!("{:?}", err);
                        match serde_json::from_str::<Value>(json_str) {
                            Ok(val) => {
                                warn!("Raw serde_json::Value -> '{:?}'", val);
                            },
                            Err(err) => {
                                warn!("Not valid JSON!");
                                warn!("{:?}", err);
                            }
                        }
                    }
                }
            }
            _ => {
                // tx_lock.unbounded_send(msg.clone()).unwrap();
            }
        }
        Ok(())
    });

    let receive_from_others = rx.map(Ok).forward(outgoing);
    pin_mut!(process_incoming, receive_from_others);
    
    // receive_from_others.await;
    future::select(process_incoming, receive_from_others).await;

    info!("{} disconnected", &peer);
    state.write().await.clients.remove(&client.uuid);
    
    // TODO: bring back client leave broadcasts
    // for other in state_cell.lock().await.read().await.clients.values() {        
    //     other.sender.unbounded_send(Message::from(encode_cmd(
    //         &ServerCommand::Status(info.clone())
    //     ))).unwrap();
    // }

    Ok(())
}

const JWT_KEY_PATH: &str = "../key.txt";

#[tokio::main]
async fn main() {
    env_logger::init();

    let path = Path::new(JWT_KEY_PATH);
    let display = path.display();
    let mut file = match File::create(&JWT_KEY_PATH) {
        Err(why) => panic!("couldn't create {}: {}", display, why),
        Ok(file) => file,
    };

    match file.write_all(JWT_KEY.as_bytes()) {
        Err(why) => panic!("couldn't write jwt to {}: {}", display, why),
        Ok(_) => info!("successfully wrote jwt to {}", display),
    }

    let state = Arc::new(RwLock::new(State::new()));

    let mut server = Server::new("ein csgo server".to_string(), Some(Box::new(CSGORcon::new())));
    server.connect("ein:27015", "bruh").await.ok();

    state.write().await.servers.insert(*server.id(), server);

    let addr = "0.0.0.0:18249";
    let listener = TcpListener::bind(&addr).await.expect("Can't listen");
    info!("Listening on: {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        let peer = stream.peer_addr().expect("connected streams should have a peer address");
        info!("Peer address: {}", peer);

        tokio::spawn(accept_connection(peer, stream, state.clone()));
    }
}