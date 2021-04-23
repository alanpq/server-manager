use crate::{communicator::Communicator, state::State};
use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Serialize, Deserialize)]
#[derive(Clone)]
pub enum CommunicatorStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}

#[derive(Serialize, Deserialize)]
#[derive(Clone)]
pub struct ServerInfo {
  pub name: String,
  pub communicator: CommunicatorStatus,
  pub clients: Value,
}

pub struct Server {
  info: ServerInfo,
  communicator: Box<dyn Communicator + Send>
}

impl Server {
  pub fn new(name: String, communicator: Box<dyn Communicator + Send>) -> Server {
    Server {
      info: ServerInfo {
        name,
        communicator: CommunicatorStatus::DISCONNECTED,
        clients: Value::Null,
      },
      communicator
    }
  }

  pub async fn send_cmd(&mut self, cmd: String) -> String {
    self.communicator.send_cmd(cmd).await
  }
  
  pub async fn connect(&mut self, address: &str, password: &str) -> Result<(), communicator::Error> {
    self.info.communicator = CommunicatorStatus::CONNECTING;
    let res = self.communicator.connect(address, password).await;
    if res.is_err() {
      self.info.communicator = CommunicatorStatus::DISCONNECTED;
      return Err(communicator::Error::ConnectionError);
    } else {
    self.info.communicator = CommunicatorStatus::CONNECTED;
    }
    Ok(())
  }
  
  pub fn info(&self) -> ServerInfo {
    return self.info.clone();
  }

  fn name(&self) -> &String {
    return &self.info.name;
  }

  fn set_name(&mut self, name: String) {
    self.info.name = name;
  }
}