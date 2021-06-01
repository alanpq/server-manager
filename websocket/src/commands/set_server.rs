use uuid::Uuid;
use log::{info, warn, debug};
use tokio::sync::RwLock;
use crate::state::State;
use tungstenite::Message;
use crate::encode_cmd;
use crate::commands::ServerCommand;

pub async fn set_server(state: &RwLock<State>, client_id: &Uuid, id: &Uuid) -> Option<Message> {
    let mut state = state.write().await;
    match state.servers.get(id) {
        Some(_) => {
            if let Some(client) = state.clients.get(client_id) {
                let mut new_c = client.clone();
                new_c.server = Some(*id);
                state.clients.insert(*client_id, new_c);
                debug!("set client server to {}", id);
            }
        },
        None => {
            debug!("could not find server id {}", id);
            return Some(Message::from(encode_cmd(
                &ServerCommand::Print("Server not found.".to_string())
            )))
        }
    }
    None
}