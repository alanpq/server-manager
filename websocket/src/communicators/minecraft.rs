use crate::communicator::Communicator;
use async_trait::async_trait;
use rcon::Connection;
use serde::Serialize;
use serde_json::{Value, json};
use log::*;
use crate::communicators::CommunicatorType;
use crate::communicator;

#[derive(Serialize)]
pub struct MCRcon {
    #[serde(skip)]
    conn: Option<Connection>,
    #[serde(rename = "text/address")]
    address: String,
    #[serde(rename = "password/password")]
    password: String,
}

impl MCRcon {
    pub fn new() -> MCRcon {
        MCRcon {
            conn: None,
            address: String::new(),
            password: String::new(),
        }
    }
}

#[async_trait]
impl Communicator for MCRcon {
    async fn send_cmd(&mut self, cmd: String) -> String {
        if self.conn.is_some() {
            return self.conn.as_mut().unwrap().cmd(cmd.as_str()).await.unwrap();
        }
        return "Not connected to server.".to_string()
    }

    async fn connect(&mut self) -> Result<(), rcon::Error> {
        debug!("{}:{}", self.address, self.password);
        let conn = Connection::builder().enable_minecraft_quirks(true).connect(&self.address, &self.password).await?;
        self.conn = Some(conn);
        Ok(())
    }

    async fn disconnect(&mut self) -> Result<(), communicator::Error> {
        self.conn = None;
        Ok(())
    }

    fn comm_type(&self) -> CommunicatorType {
        CommunicatorType::MC
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
        debug!("{} / {}", self.address, self.password);
        if let Some(obj) = new.as_object() {
            if let Some(v) = obj.get("text/address") {
                if v.is_string() {
                    debug!("{}", v.as_str().unwrap());
                    debug!("{}", v.as_str().unwrap().to_string());
                    self.address = String::from(v.as_str().unwrap());
                }
            }
            if let Some(v) = obj.get("password/password") {
                if v.is_string() {
                    self.password = String::from(v.as_str().unwrap_or_default());
                }
            }
        }
        Ok(())
    }
}