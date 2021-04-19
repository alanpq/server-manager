use crate::communicator::Communicator;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
#[derive(Clone)]
pub struct ServerInfo {
  name: String,
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
      },
      communicator
    }
  }

  pub async fn send_cmd(&mut self, cmd: String) -> String {
    self.communicator.send_cmd(cmd).await
  }
  
  pub async fn connect(&mut self, address: &str, password: &str) -> Result<(), rcon::Error> {
    self.communicator.connect(address, password).await
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