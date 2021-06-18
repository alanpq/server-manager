use std::{fmt};
use async_trait::async_trait;
use serde_json::Value;
use crate::communicators::CommunicatorType;

#[derive(Debug)]
pub enum Error {
  ConnectionError(String)
}

impl std::error::Error for Error {
  fn description(&self) -> &str {
    match *self {
        Error::ConnectionError(_) => "Failed to connect to gameserver",
    }
}
}

impl fmt::Display for Error {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Error::ConnectionError(description) => write!(f, "Communicator Connection Error: {}", description),
    }
  }
}

impl From<rcon::Error> for Error {
  fn from(cause: rcon::Error) -> Error {
    Error::ConnectionError(cause.to_string())
  }
}

#[async_trait]
pub trait Communicator {
  async fn send_cmd(&mut self, cmd: String) -> String;
  async fn connect(&mut self) -> Result<(), rcon::Error>;
  async fn disconnect(&mut self) -> Result<(), Error>;

  fn comm_type(&self) -> CommunicatorType;
  fn settings(&self) -> Value;
  fn update_settings(&mut self, new: Value) -> Result<(), Box<dyn std::error::Error>>;
}