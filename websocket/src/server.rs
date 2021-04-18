pub struct Server {
  name: String,
  communicator: Box<dyn Communicator>
}

impl Server {
  fn new(name: String, communicator: Box<dyn Communicator>) -> Server {
    Server {
      name,
      communicator
    }
  }

  fn name(&self) -> &String {
    return &self.name;
  }

  fn set_name(&mut self, name: String) {
    self.name = name;
  }
}