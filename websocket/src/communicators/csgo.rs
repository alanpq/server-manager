use crate::communicator::Communicator;
use async_trait::async_trait;
use rcon::Connection;
use serde::Serialize;
use serde_json::{Value, json};
use log::*;
use crate::communicators::CommunicatorType;

#[derive(Serialize)]
pub struct CSGORcon {
  #[serde(skip)]
  conn: Option<Connection>,
  #[serde(rename = "password/password")]
  password: String,
}

impl CSGORcon {
  pub fn new() -> CSGORcon {
    CSGORcon {
      conn: None,
      password: String::new(),
    }
  }
}

#[async_trait]
impl Communicator for CSGORcon {
  async fn send_cmd(&mut self, cmd: String) -> String {
    if self.conn.is_some() {
      return self.conn.as_mut().unwrap().cmd(cmd.as_str()).await.unwrap();
    }
    return "Not connected to server.".to_string()
  }

  async fn connect(&mut self, address: &str, password: &str) -> Result<(), rcon::Error> {
    let conn = Connection::builder().connect(address, password).await?;
    self.conn = Some(conn);
    Ok(())
  }

  fn comm_type(&self) -> CommunicatorType {
    CommunicatorType::CSGO
  }

  fn settings(&self) -> Value {
    match serde_json::to_value(self) {
      Ok(json) => {
        json
      },
      Err(err) => {
        error!("could not obtain settings");
        error!("{}", err);
        Value::Null
      }
    }
  }

  fn update_settings(&mut self, new: Value) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(obj) = new.as_object() {
      if let Some(pwd) = obj.get("password") {
        self.password = pwd.to_string();
      }
    }

    Ok(())
  }
}