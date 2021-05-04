use crate::{communicators::CommunicatorType, server::{Message, ServerInfo}, state::Client};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Debug)]
#[derive(Serialize)]
#[serde(tag = "type", content = "body")]
pub enum ServerCommand {
  Status(ServerInfo),
  Print(String),
  ForeignCommand{id: Uuid, cmd: String, out: String},
  Identity(Client),

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
  ServerLog(Option<usize>), // get page of server log (if no page specified, return last page)

  CreateServer,
  UpdateServer{id: Uuid, name: Option<String>, communicator_type: Option<CommunicatorType>},
  RemoveServer(Uuid),
  ListServers,
}