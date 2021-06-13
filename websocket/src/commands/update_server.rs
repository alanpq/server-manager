use uuid::Uuid;
use crate::communicators::CommunicatorType;
use tokio::sync::RwLock;
use crate::state::State;
use tungstenite::Message;

pub async fn update_server(state: &RwLock<State>, client_id: &Uuid, id: &Uuid, name: &Option<String>, communicator_type: &Option<CommunicatorType>) -> Option<Vec<Message>> {

    None
}