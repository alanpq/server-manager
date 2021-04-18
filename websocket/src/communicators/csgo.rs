use crate::communicator::Communicator;
use async_trait::async_trait;
use rcon::Connection;

pub struct CSGORcon {
  name: String,
  conn: Option<Connection>,
}

impl CSGORcon {
  pub fn new() -> CSGORcon {
    CSGORcon {
      conn: None,
      name: String::new(),
    }
  }
}

#[async_trait]
impl Communicator for CSGORcon {
  fn name(&self) -> &String {
    return &self.name;
  }

  fn set_name(&mut self, name: String) {
    self.name = name;
  }

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
}