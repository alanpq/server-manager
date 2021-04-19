use crate::communicator::Communicator;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct ServerInfo {
  name: String,
}

pub struct Server {
  info: ServerInfo,
  communicator: Box<dyn Communicator>
}

impl Server {
  fn new(name: String, communicator: Box<dyn Communicator>) -> Server {
    Server {
      info: ServerInfo {
        name,
      },
      communicator
    }
  }

  fn name(&self) -> &String {
    return &self.info.name;
  }

  fn set_name(&mut self, name: String) {
    self.info.name = name;
  }
}