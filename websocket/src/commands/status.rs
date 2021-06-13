use uuid::Uuid;
use tokio::sync::RwLock;
use crate::state::State;
use tungstenite::Message;

pub async fn status(state: &RwLock<State>, client_id: &Uuid, id: &Option<Uuid>) -> Option<Vec<Message>> {
    if id.is_none() {
        return None;
    }
    let id = id.unwrap();
    let state = state.read().await;
    let server = state.servers.get(&id);
    if server.is_none() {
        return None;
    }
    let server = server.unwrap();

    let mut info = server.info();
    info.settings = server.get_settings();
    info.clients = serde_json::to_value(&state.clients).unwrap();
    // tx_lock.unbounded_send(Message::from(encode_cmd(
    //     &ServerCommand::Status(info)
    // ))).unwrap();

    None
}