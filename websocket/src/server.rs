use std::borrow::BorrowMut;

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
  CONNECTED,
  MISSING
}

/* TODO: separate ServerInfo and ServerSettings 
 * makes more sense to have a dedicated struct for user configurable properties,
 * and to reference this in ServerInfo */
#[derive(Debug)]
#[derive(Serialize, Deserialize)]
#[derive(Clone)]
pub struct ServerInfo { 
  pub id: Uuid,
  pub name: String,
  pub communicator: CommunicatorStatus,
  pub clients: Value,
}

pub struct Server {
  id: Uuid,
  info: ServerInfo,
  communicator: Option<Box<dyn Communicator + Send + Sync>>
}

impl Server {
  pub fn new(name: String, communicator: Option<Box<dyn Communicator + Send + Sync>>) -> Server {
    let id = Uuid::new_v4();
    Server {
      id,
      info: ServerInfo {
        id, 
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
  pub fn create(name: String, communicator: Option<CommunicatorType>) -> Server {
    match communicator {
      Some(communicator) => {
        match communicator {
          CommunicatorType::CSGO => {
            Server::new(name, Some(Box::new(CSGORcon::new())))
          },
        }
      },
      None => {
        let mut s = Server::new(name, None);
        s.info.communicator = CommunicatorStatus::MISSING;
        s
      }
    }
  }

  pub fn id(&self) -> &Uuid {
    return &self.id;
  } 

  pub async fn send_cmd(&mut self, cmd: String) -> String {
    match self.communicator.as_mut() {
      Some(communicator) => {
        communicator.send_cmd(cmd).await
      },
      None => {
        String::new()
      }
    }
  }
  
  pub async fn connect(&mut self, address: &str, password: &str) -> Result<(), communicator::Error> {
    match self.communicator.as_mut() {
      Some(communicator) => {
        self.info.communicator = CommunicatorStatus::CONNECTING;
        let res = communicator.connect(address, password).await;
        if res.is_err() {
          self.info.communicator = CommunicatorStatus::DISCONNECTED;
          return Err(communicator::Error::ConnectionError);
        } else {
          self.info.communicator = CommunicatorStatus::CONNECTED;
        }
        Ok(())
      },
      None => {
        self.info.communicator = CommunicatorStatus::MISSING;
        Ok(())
      }
    }
    
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