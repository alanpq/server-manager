use async_trait::async_trait;

#[async_trait]
pub trait Communicator {
  fn name(&self) -> &String;
  fn set_name(&mut self, name: String);

  async fn send_cmd(&mut self, cmd: String) -> String;
  async fn connect(&mut self, address: &str, password: &str) -> Result<(), rcon::Error>;
}