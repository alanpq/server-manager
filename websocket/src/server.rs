use crate::{communicator::{self, Communicator}, communicators::{CommunicatorType, csgo::CSGORcon}};
use serde::{Serialize, Deserialize};
use serde_json::Value;
use uuid::Uuid;
use chrono::{Utc};
use std::cmp;
use crate::communicators::generate_communicator;

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
  pub communicator: CommunicatorStatus, // TODO: rename this to comm_status
  pub comm_type: CommunicatorType,
  pub settings: Value,
  pub clients: Value,
}
#[derive(Debug)]
#[derive(Serialize, Deserialize)]
#[derive(Clone)]
pub enum MessageType {
  IN,
  OUT
}

#[derive(Debug)]
#[derive(Serialize, Deserialize)]
#[derive(Clone)]
pub struct Message {
  pub timestamp: i64,
  pub user: Uuid,
  pub body: String,
  pub msg_type: MessageType,
}

impl Message {
  pub fn new(user: Uuid, body: String, msg_type: MessageType) -> Message {
    Message {
      timestamp: Utc::now().timestamp(),
      user,
      body,
      msg_type,
    }
  }
}

pub const PAGE_SIZE: usize = 50; // server page size, in messages

pub type BoxedCommunicator = Box<dyn Communicator + Send + Sync>;

pub struct Server {
  id: Uuid,
  info: ServerInfo,
  communicator: Option<BoxedCommunicator>,
  messages: Vec<Message>,
}

impl Server {
  pub fn new(name: String) -> Server {
    let id = Uuid::new_v4();
    Server {
      id,
      info: ServerInfo {
        id, 
        name,
        communicator: CommunicatorStatus::MISSING,
        comm_type: CommunicatorType::None,
        settings: Value::Null,
        clients: Value::Null,
      },
      communicator: None,
      messages: Vec::new(),
    }
  }

  pub fn set_communicator(&mut self, comm_type: &CommunicatorType) {
    self.info.communicator = CommunicatorStatus::DISCONNECTED;
    self.info.comm_type = *comm_type;
    self.communicator = generate_communicator(comm_type);
  }

  pub fn set_name(&mut self, name: &str) {
    self.info.name = name.to_string();
  }

  pub fn id(&self) -> &Uuid {
    &self.id
  } 

  pub async fn send_cmd(&mut self, user: &Uuid, cmd: String) -> String {
    self.messages.push(Message::new(*user,cmd.clone(), MessageType::IN));
    match self.communicator.as_mut() {
      Some(communicator) => {
        let r = communicator.send_cmd(cmd).await;
        self.messages.push(Message::new(*user, r.clone(), MessageType::OUT));
        r
      },
      None => {
        let s = "No communicator has been set up!".to_string();
        self.messages.push(Message::new(*user, s.clone(), MessageType::OUT));
        s
      }
    }
  }

  pub fn push_msg(&mut self, msg: &Message) {
    self.messages.push(msg.clone());
  }
  
  pub async fn connect(&mut self) -> Result<(), communicator::Error> {
    match self.communicator.as_mut() {
      Some(communicator) => {
        self.info.communicator = CommunicatorStatus::CONNECTING;
        let res = communicator.connect().await;
        if res.is_err() {
          self.info.communicator = CommunicatorStatus::DISCONNECTED;
          return Err(communicator::Error::ConnectionError(res.unwrap_err().to_string()));
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

  pub async fn disconnect(&mut self) -> Result<(), communicator::Error> {
    match self.communicator.as_mut() {
      Some(communicator) => {
        let res = communicator.disconnect().await;
        if res.is_err() {
          self.info.communicator = CommunicatorStatus::CONNECTED;
          return Err(communicator::Error::ConnectionError(res.unwrap_err().to_string()));
        } else {
          self.info.communicator = CommunicatorStatus::DISCONNECTED;
          return Ok(());
        }
      },
      None => {
        self.info.communicator = CommunicatorStatus::MISSING;
        Ok(())
      }
    }
  }

  pub fn get_page(&self, page_no: usize) -> Vec<Message> {
    let start = page_no*PAGE_SIZE;
    self.messages[start.. cmp::min(start+PAGE_SIZE, self.messages.len())].to_vec()
  }

  pub fn message_count(&self) -> usize {
    self.messages.len()
  }
  
  pub fn info(&self) -> ServerInfo {
    let mut info = self.info.clone();
    if let Some(comm) = self.communicator.as_ref() {
      info.comm_type = comm.comm_type();
    }
    info.settings = self.get_settings();
    info
  }

  pub fn get_settings(&self) -> Value {
    match self.communicator.as_ref() {
      Some(comm) => {
        comm.settings()
      },
      None => {
        Value::Null
      }
    }
  }

  pub fn update_settings(&mut self, settings: &Value) {
    if let Some(communicator) = &mut self.communicator {
      communicator.update_settings(settings.clone()).unwrap();
    }
  }
}