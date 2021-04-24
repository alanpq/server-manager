use crate::{communicator::{self, Communicator}, communicators::{CommunicatorType, csgo::CSGORcon}, state::State};
use serde::{Serialize, Deserialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug)]
#[derive(Serialize, Deserialize)]
#[derive(Clone)]
pub enum CommunicatorStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}

#[derive(Debug)]
#[derive(Serialize, Deserialize)]
#[derive(Clone)]
pub struct ServerInfo {
  pub name: String,
  pub communicator: CommunicatorStatus,
  pub clients: Value,
}

pub struct Server {
  id: Uuid,
  info: ServerInfo,
  communicator: Box<dyn Communicator + Send + Sync>
}

impl Server {
  pub fn new(name: String, communicator: Box<dyn Communicator + Send + Sync>) -> Server {
    Server {
      id: Uuid::new_v4(),
      info: ServerInfo {
        name,
        communicator: CommunicatorStatus::DISCONNECTED,
        clients: Value::Null,
      },
      communicator
    }
  }
  // TODO: better server creation infra
  // im 90% sure theres a way to delegate the creation code to the communicators themselves
  // that way the footprint of a new communicator is ideally only in 1 file
  pub fn create(name: String, communicator: CommunicatorType) -> Server {
    match communicator {
      CommunicatorType::CSGO => {
        Server::new(name, Box::new(CSGORcon::new()))
      },
    }
  }

  pub fn id(&self) -> &Uuid {
    return &self.id;
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