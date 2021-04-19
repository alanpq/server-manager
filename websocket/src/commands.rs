use crate::{server::ServerInfo, state::Client};
use serde::{Serialize, Deserialize};

#[derive(Serialize)]
#[serde(tag = "type", content = "body")]
pub enum Command {
  Status(ServerInfo),
  Print(String),
  ForeignCommand{cmd: String, out: String},
  Identity(Client),
}