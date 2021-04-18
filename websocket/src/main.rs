mod communicator;

mod communicators;
use communicator::Communicator;
use communicators::csgo::{CSGORcon};

extern crate rcon;

use futures_util::{SinkExt, StreamExt};
use log::*;
use std::net::SocketAddr;
use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::{accept_async, tungstenite::Error};
use tungstenite::{Result, Message};

async fn accept_connection(peer: SocketAddr, stream: TcpStream) {
    if let Err(e) = handle_connection(peer, stream).await {
        match e {
            Error::ConnectionClosed | Error::Protocol(_) | Error::Utf8 => (),
            err => error!("Error processing connection: {}", err),
        }
    }
}

async fn handle_connection(peer: SocketAddr, stream: TcpStream) -> Result<()> {
    let mut ws_stream = accept_async(stream).await.expect("Failed to accept");

    info!("New WebSocket connection: {}", peer);

    let mut communicator = CSGORcon::new();
    communicator.connect("ein:27015", "bruh").await.unwrap();
    
    while let Some(msg) = ws_stream.next().await {
        let msg = msg?;
        match msg {
            Message::Text(msg) => {
                let res = communicator.send_cmd(msg.to_string()).await;
                ws_stream.send(Message::from(res)).await?;
            },
            _ => {
                ws_stream.send(msg).await?;
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