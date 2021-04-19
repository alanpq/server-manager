mod communicator;

mod communicators;
use commands::Command;
use communicator::Communicator;
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
use std::cell::RefCell;
use std::sync::atomic::{Ordering};

use rand::random;

use futures_util::{future, pin_mut, stream::TryStreamExt, SinkExt, StreamExt};
use log::*;
use std::net::SocketAddr;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{RwLock, Mutex};
use tokio_tungstenite::{accept_async, tungstenite::Error};
use tungstenite::{Result, Message};
use serde_json::Value;

use futures_channel::mpsc::{unbounded};

async fn accept_connection(peer: SocketAddr, stream: TcpStream, state: Arc<RwLock<State>>) {
    if let Err(e) = handle_connection(peer, stream, state).await {
        match e {
            Error::ConnectionClosed | Error::Protocol(_) | Error::Utf8 => (),
            err => error!("Error processing connection: {}", err),
        }
    }
}

fn encode_cmd(cmd: &Command) -> Vec<u8> {
    Vec::from(encode(serde_json::to_string(cmd).unwrap()).as_bytes())
}

async fn handle_connection(peer: SocketAddr, stream: TcpStream, state: Arc<RwLock<State>>) -> Result<()> {
    let mut ws_stream = accept_async(stream).await.expect("Failed to accept");

    info!("New WebSocket connection: {}", peer);

    // Use an unbounded channel to handle buffering and flushing of messages
    // to the websocket...
    let (tx, rx) = unbounded();

    let (mut outgoing, mut incoming) = ws_stream.split();

    let client = Client {
        uuid: uuid::Uuid::new_v4(),
        name: "hey".to_string(),
        hue: random(),
        sender: tx.clone()
    };
    // let mut state_w = ;
    state.write().await.clients.insert(client.uuid, client.clone());

    // TODO: one server, multiple ws connections
    let mut server = Server::new("ein csgo server".to_string(), Box::new(CSGORcon::new()));
    server.connect("ein:27015", "bruh").await.unwrap();

    outgoing.send(Message::from(encode_cmd(
        &Command::Identity(client.clone())
    ))).await?;

    state.read().await.count.fetch_add(1, Ordering::Relaxed);

    let server_cell = Arc::new(Mutex::new(server));
    let state_cell = Arc::new(Mutex::new(state));
    let tx_cell = Arc::new(Mutex::new(tx.clone()));

    let process_incoming = incoming.try_for_each(|msg| async {
        let mut server_lock = server_cell.lock().await;
        let state_lock = state_cell.lock().await;
        let tx_lock = tx_cell.lock().await;
        match msg {
            Message::Text(msg) => {
                let res = server_lock.send_cmd(msg.to_string()).await;
                for other in state_lock.read().await.clients.values() {
                    if other.uuid == client.uuid {
                        continue;
                    }
                    other.sender.unbounded_send(Message::from(encode_cmd(&Command::ForeignCommand{
                        cmd: msg.to_string(),
                        out: res.clone()
                    }))).unwrap();
                    
                }
                tx_lock.unbounded_send(Message::from(res)).unwrap();
            },
            Message::Binary(bin) => {
                // bin.into_iter().map(|b| {
                //     println!("{}",b);
                //     b
                // });

                let json = str::from_utf8(&bin).unwrap();
                let json = decode(json).unwrap();
                let json = str::from_utf8(&json).unwrap();
                let json: Value = serde_json::from_str(json).unwrap();
                match &json["type"] {
                    Value::String(str) => {
                        match str.as_str() {
                            "stats" => {
                                let mut info = server_lock.info();
                                info.clients = serde_json::to_value(&state_lock.read().await.clients).unwrap();
                                tx_lock.unbounded_send(Message::from(encode_cmd(
                                    &Command::Status(info)
                                ))).unwrap();
                            },
                            _ => {
                                tx_lock.unbounded_send(Message::from(encode_cmd(
                                    &Command::Print("Unknown command".to_string())
                                ))).unwrap();
                            },
                        }
                    },
                    _ => {}
                }
            }
            _ => {
                tx_lock.unbounded_send(msg.clone()).unwrap();
            }
        }
        Ok(())
    });

    let receive_from_others = rx.map(Ok).forward(outgoing);
    pin_mut!(process_incoming, receive_from_others);
    
    // receive_from_others.await;
    future::select(process_incoming, receive_from_others).await;
    // future::select(broadcast_incoming, receive_from_others).await;

    println!("{} disconnected", &peer);
    // state.write().await.clients.remove(&client.uuid);

    Ok(())
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let mut state = Arc::new(RwLock::new(State::new()));

    let addr = "0.0.0.0:18249";
    let listener = TcpListener::bind(&addr).await.expect("Can't listen");
    info!("Listening on: {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        let peer = stream.peer_addr().expect("connected streams should have a peer address");
        info!("Peer address: {}", peer);

        tokio::spawn(accept_connection(peer, stream, state.clone()));
    }
}