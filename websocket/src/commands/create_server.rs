use tokio::sync::RwLock;
use crate::state::State;
use tungstenite::Message;
use crate::encode_cmd;
use crate::commands::ServerCommand;
use crate::server::Server;
use uuid::Uuid;

pub async fn create_server(state: &RwLock<State>, client_id: &Uuid) -> Option<Vec<Message>> {
    let mut server = Server::create("new server ".to_string() + &state.read().await.servers.len().to_string(), None);
    server.connect("192.168.1.16", "bruh").await.unwrap();
    state.write().await.servers.insert(*server.id(), server);

    // arghhhh no code reuse >:((((
    let state = state.read().await;
    let mut tx = Vec::new();
    tx.push(Message::from(encode_cmd(
        &ServerCommand::ServerList(state.servers.values().map(|srv| {
            srv.info()
        }).collect())
    )));
    Some(tx)
}