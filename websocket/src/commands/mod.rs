use crate::{communicators::CommunicatorType, server::{Message, ServerInfo}, state::Client};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

mod command;
mod create_server;
mod list_servers;
mod remove_server;
mod server_log;
mod set_server;
mod status;
mod update_server;

pub use {
  command::command,
  create_server::create_server,
  list_servers::list_servers,
  remove_server::remove_server,
  server_log::server_log,
  set_server::set_server,
  status::status,
  update_server::update_server,
};
use crate::state::State;
use tokio::sync::RwLock;
use futures::channel::mpsc::UnboundedSender;

#[derive(Debug)]
#[derive(Serialize)]
#[serde(tag = "type", content = "body")]
pub enum ServerCommand {
  Status(ServerInfo),
  Print(String),
  Command{user: Uuid, server: Uuid, cmd: String, out: String},
  Identity{client: Client, communicator_types: Vec<String>},

  ServerLog{page_no: usize, messages: Vec<Message>, server_id: Uuid},

  ServerList(Vec<ServerInfo>)
}

#[derive(Debug)]
#[derive(Deserialize)]
#[serde(tag = "type", content = "body")]
pub enum ClientCommand {
  Command{id: Uuid, cmd: String},
  Status(Option<Uuid>), // get status of server

  SetServer(Uuid), // set client's current server id
  ServerLog{id: Uuid, page_no: Option<usize>}, // get page of server log (if no page specified, return last page)

  CreateServer,
  UpdateServer{id: Uuid, name: Option<String>, communicator_type: Option<CommunicatorType>},
  RemoveServer(Uuid),
  ListServers,
}

pub async fn process_command(cmd: ClientCommand, client_id: &Uuid, state: &RwLock<State>) -> Option<Vec<tungstenite::Message>>{
  match cmd {
    ClientCommand::Command{id, cmd} => command(state, client_id, &id, &cmd).await,
    ClientCommand::Status(id) => status(state, client_id, &id).await,

    ClientCommand::SetServer(id) => set_server(state, client_id, &id).await,
    ClientCommand::ServerLog{id, page_no} => server_log(state, client_id, &id, &page_no).await,

    ClientCommand::CreateServer => create_server(state, client_id).await,
    ClientCommand::UpdateServer {
      id,
      name,
      communicator_type
    } => update_server(state, client_id, &id, &name, &communicator_type).await,
    ClientCommand::RemoveServer(id) => remove_server(state, client_id, &id).await,
    ClientCommand::ListServers => list_servers(state, client_id).await,
  }
}