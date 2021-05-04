use std::{sync::atomic::AtomicU32};
use std::collections::HashMap;
use tungstenite::Message;
use uuid::Uuid;
use serde::{Serialize};
use futures_channel::mpsc::{UnboundedSender};

use crate::server::Server;
#[derive(Debug)]
#[derive(Serialize)]
#[derive(Clone)]
pub struct Client {
  pub uuid: Uuid,
  pub name: String,
  pub hue: u8,

  pub server: Option<Uuid>,

  #[serde(skip)]
  pub sender: UnboundedSender<Message>
}

pub struct State {
  pub count: AtomicU32,
  pub clients: HashMap<Uuid, Client>,
  pub servers: HashMap<Uuid, Server>,
}

impl State {
  pub fn new() -> State {
    State {
      count: AtomicU32::new(0),
      clients: HashMap::new(),
      servers: HashMap::new(),
    }
  }
}