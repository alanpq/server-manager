use crate::{server::ServerInfo, state::Client};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Serialize)]
#[serde(tag = "type", content = "body")]
pub enum Command {
  Status(ServerInfo),
  Print(String),
  ForeignCommand{id: Uuid, cmd: String, out: String},
  Identity(Client),
}