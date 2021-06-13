use log::debug;
use tokio::sync::RwLock;
use crate::state::State;
use crate::server;
use tungstenite::Message;
use uuid::Uuid;

pub async fn server_log(state: &RwLock<State>, client_id: &Uuid, page_no: &Option<usize>) -> Option<Vec<Message>> {
    // messages are grouped in pages of some size
    // these pages are numbered in ascending order of timestamp
    let state = state.read().await;
    let client = state.clients.get(client_id).expect("client should exist");
    match client.server {
        Some(srv) => {
            match state.servers.get(&srv) {
                Some(srv) => {
                    let page_no = page_no.unwrap_or_else(|| { // if no page specified, get last page
                        srv.message_count() / server::PAGE_SIZE
                    });
                    // tx_lock.unbounded_send(Message::from(encode_cmd(
                    //     &ServerCommand::ServerLog{
                    //         page_no,
                    //         messages: srv.get_page(page_no),
                    //         server_id: *srv.id(),
                    //     }
                    // ))).unwrap();
                    debug!("sent ServerLog");
                },
                None => {
                    debug!("could not find server id {}", srv);
                }
            }
        },
        None => {
            debug!("client does not have assigned server id")
        },
    }
    None
}