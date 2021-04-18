use crate::communicator::Communicator;
use async_trait::async_trait;
use rcon::Connection;

pub struct CSGORcon {
  conn: Option<Connection>,
}

impl CSGORcon {
  pub fn new() -> CSGORcon {
    CSGORcon {
      conn: None,
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
}