use log::debug;
use tokio::sync::RwLock;
use crate::state::State;
use crate::{server, encode_cmd};
use tungstenite::Message;
use uuid::Uuid;
use crate::commands::ServerCommand;

pub async fn server_log(state: &RwLock<State>, client_id: &Uuid, server_id: &Uuid, page_no: &Option<usize>) -> Option<Vec<Message>> {
    // messages are grouped in pages of some size
    // these pages are numbered in ascending order of timestamp
    let state = state.read().await;
    let client = state.clients.get(client_id).expect("client should exist");
    if let Some(server) = state.servers.get(server_id) {
        let page_no = page_no.unwrap_or_else(|| { // if no page specified, get last page
            server.message_count() / server::PAGE_SIZE
        });
        let mut tx = Vec::new();
        tx.push(Message::from(encode_cmd(
            &ServerCommand::ServerLog {
                page_no,
                messages: server.get_page(page_no),
                server_id: *server_id,
            }
        )));
        debug!("sent ServerLog");
        return Some(tx);
    } else {
        debug!("could not find server id {}", server_id);
    }
    None
}