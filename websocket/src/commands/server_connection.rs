use tokio::sync::RwLock;
use crate::state::State;
use tungstenite::Message;
use uuid::Uuid;
use crate::encode_cmd;
use crate::commands::ServerCommand;
use std::borrow::BorrowMut;
use crate::server::MessageType;
use log::warn;

pub async fn connect_server(state: &RwLock<State>, client_id: &Uuid, id: &Uuid) -> Option<Vec<Message>> {
    let mut state = state.write().await;
    if let Some(srv) = state.servers.get_mut(id) {
        let mut msg = ServerCommand::Command {
            cmd: "> Connect communicator".to_string(),
            out: "Connected.".to_string(),
            server: *id,
            user: *client_id,
        };
        if let ServerCommand::Command {ref cmd, ref mut out, ..} = msg {
            srv.push_msg(&crate::server::Message::new(*client_id, cmd.clone(), MessageType::IN));
            if let Err(e) = srv.connect().await {
                *out = e.to_string();
                warn!("{}", e);
            }
            srv.push_msg(&crate::server::Message::new(*client_id, out.clone(), MessageType::OUT));
        }

        return Some(vec!(Message::from(encode_cmd(
            &ServerCommand::Status(srv.info())
        )), Message::from(encode_cmd(&msg))));
    }
    None
}

pub async fn disconnect_server(state: &RwLock<State>, client_id: &Uuid, id: &Uuid) -> Option<Vec<Message>> {
    let mut state = state.write().await;
    if let Some(srv) = state.servers.get_mut(id) {
        let mut msg = ServerCommand::Command {
            cmd: "> Disconnect communicator".to_string(),
            out: "Disconnected.".to_string(),
            server: *id,
            user: *client_id,
        };
        if let ServerCommand::Command {ref cmd, ref mut out, ..} = msg {
            srv.push_msg(&crate::server::Message::new(*client_id, cmd.clone(), MessageType::IN));
            if let Err(e) = srv.disconnect().await {
                *out = e.to_string();
                warn!("{}", e);
            }
            srv.push_msg(&crate::server::Message::new(*client_id, out.clone(), MessageType::OUT));
        }

        return Some(vec!(Message::from(encode_cmd(
            &ServerCommand::Status(srv.info())
        )), Message::from(encode_cmd(&msg))));
    }
    None
}