use std::{fmt, rc};
use async_trait::async_trait;

#[derive(Debug)]
pub enum Error {
  ConnectionError
}

impl std::error::Error for Error {
  fn description(&self) -> &str {
    match *self {
        Error::ConnectionError => "Failed to connect to gameserver",
    }
}
}

impl fmt::Display for Error {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Error::ConnectionError => write!(f, "Communicator Connection Error"),
    }
  }
}

impl From<rcon::Error> for Error {
  fn from(cause: rcon::Error) -> Error {
    Error::ConnectionError
  }
}

#[async_trait]
pub trait Communicator {
  async fn send_cmd(&mut self, cmd: String) -> String;
  async fn connect(&mut self, address: &str, password: &str) -> Result<(), rcon::Error>;
}