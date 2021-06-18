use uuid::Uuid;
use crate::communicators::CommunicatorType;
use tokio::sync::RwLock;
use crate::state::State;
use tungstenite::Message;
use serde_json::Value;
use crate::encode_cmd;
use crate::commands::ServerCommand;

pub async fn update_server(
    state: &RwLock<State>,
    client_id: &Uuid,
    id: &Uuid,
    name: &Option<String>,
    communicator_type: &Option<CommunicatorType>,
    settings: &Option<Value>,
) -> Option<Vec<Message>> {
    let mut state_lock = state.write().await;
    if let Some(client) = state_lock.clients.get(client_id) {
        if let Some(server) = state_lock.servers.get_mut(id) {
            if let Some(name) = name {
                server.set_name(name);
            }
            if let Some(comm_type) = communicator_type {
                server.set_communicator(comm_type);
            }
            if let Some(settings) = settings {
                server.update_settings(settings);
            }
            return Some(vec!(Message::from(encode_cmd(
                &ServerCommand::Status(server.info())
            ))));
        }
    }
    None
}