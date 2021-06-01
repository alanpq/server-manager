use uuid::Uuid;
use tokio::sync::RwLock;
use crate::state::State;
use tungstenite::Message;

pub async fn remove_server(state: &RwLock<State>, client_id: &Uuid, id: &Uuid) -> Option<Message> {
    state.write().await.servers.remove(&id);
    None
}