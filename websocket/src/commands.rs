use crate::server::ServerInfo;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "body")]
pub enum Command {
  Status(ServerInfo),
  Print(String)
}