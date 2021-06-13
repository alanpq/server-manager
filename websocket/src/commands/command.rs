use uuid::Uuid;
use log::{info, warn, debug};
use crate::commands::ServerCommand;
use tokio::sync::RwLock;
use crate::state::State;
use tungstenite::Message;
use crate::encode_cmd;

pub async fn command(state: &RwLock<State>, client_id: &Uuid, id: &Uuid, cmd: &String) -> Option<Vec<Message>> {
    // TODO: use timestamp from when the res is actually generated, not when client receives it
    debug!("received command for {} -> '{}'", id, cmd);
    let mut state = state.write().await;
    let server = state.servers.get_mut(&id);
    if server.is_none() {
        warn!("Server '{}' not found.", &id);
        return None;
    }
    let server = server.unwrap();
    debug!("server found: {:?}", server.info());

    let res = server.send_cmd(cmd.clone()).await;
    let mut tx_msgs = Vec::new();
    for other in state.clients.values() {
        debug!("sending to {}...", other.uuid);
        tx_msgs.push(Message::from(encode_cmd(&ServerCommand::Command{
            user: *client_id,
            server: *id,
            cmd: cmd.clone(),
            out: res.clone()
        })));
    }
    return Some(tx_msgs);
}