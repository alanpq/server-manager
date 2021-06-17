use uuid::Uuid;
use tokio::sync::RwLock;
use crate::state::State;
use tungstenite::Message;
use crate::commands::ServerCommand;
use crate::encode_cmd;

pub async fn status(state: &RwLock<State>, client_id: &Uuid, id: &Option<Uuid>) -> Option<Vec<Message>> {
    if id.is_none() {
        return None;
    }
    let id = id.unwrap();
    let state = state.read().await;
    let server = state.servers.get(&id);
    server?;
    let server = server.unwrap();

    let mut info = server.info();
    info.clients = serde_json::to_value(&state.clients).unwrap();

    Some(vec!(Message::from(encode_cmd(
        &ServerCommand::Status(info)
    ))))
}