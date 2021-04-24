use crate::{communicators::CommunicatorType, server::ServerInfo, state::Client};
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

  ServerList(Vec<ServerInfo>)
}

#[derive(Debug)]
#[derive(Deserialize)]
#[serde(tag = "type", content = "body")]
pub enum ClientCommand {
  Status(),

  CreateServer{name: String, server: CommunicatorType},
  RemoveServer(Uuid),
  ListServers(),
}