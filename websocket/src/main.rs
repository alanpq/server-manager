mod communicator;

mod communicators;
use commands::Command;
use communicator::Communicator;
use communicators::csgo::{CSGORcon};

mod commands;
mod server;

extern crate rcon;
extern crate base64;

use base64::{encode, decode};
use server::Server;

use std::str;

use futures_util::{SinkExt, StreamExt};
use log::*;
use std::net::SocketAddr;
use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::{accept_async, tungstenite::Error};
use tungstenite::{Result, Message};
use serde_json::Value;

async fn accept_connection(peer: SocketAddr, stream: TcpStream) {
    if let Err(e) = handle_connection(peer, stream).await {
        match e {
            Error::ConnectionClosed | Error::Protocol(_) | Error::Utf8 => (),
            err => error!("Error processing connection: {}", err),
        }
    }
}

fn encode_cmd(cmd: &Command) -> Vec<u8> {
    Vec::from(encode(serde_json::to_string(cmd).unwrap()).as_bytes())
}

async fn handle_connection(peer: SocketAddr, stream: TcpStream) -> Result<()> {
    let mut ws_stream = accept_async(stream).await.expect("Failed to accept");

    info!("New WebSocket connection: {}", peer);

    // TODO: one server, multiple ws connections
    let mut server = Server::new("ein csgo server".to_string(), Box::new(CSGORcon::new()));
    server.connect("ein:27015", "bruh").await.unwrap();
    
    while let Some(msg) = ws_stream.next().await {
        let msg = msg?;
        match msg {
            Message::Text(msg) => {
                let res = server.send_cmd(msg.to_string()).await;
                ws_stream.send(Message::from(res)).await?;
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
                                let info = server.info();
                                ws_stream.send(Message::from(encode_cmd(
                                    &Command::Status(info)
                                ))).await?;
                            },
                            _ => {
                                ws_stream.send(Message::from(encode_cmd(
                                    &Command::Print("Unknown command".to_string())
                                ))).await?;
                            },
                        }
                    },
                    _ => {}
                }
            }
            _ => {
                ws_stream.send(msg.clone()).await?;
            }
        }

    }

    Ok(())
}

#[tokio::main]
async fn main() {
    env_logger::init();

    let addr = "0.0.0.0:8080";
    let listener = TcpListener::bind(&addr).await.expect("Can't listen");
    info!("Listening on: {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        let peer = stream.peer_addr().expect("connected streams should have a peer address");
        info!("Peer address: {}", peer);

        tokio::spawn(accept_connection(peer, stream));
    }
}