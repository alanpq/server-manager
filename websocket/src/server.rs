use crate::messages::{ClientCommand, Connect, Disconnect, WsMessage};
use actix::prelude::{Actor, Context, Handler, Recipient};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;


type Socket = Recipient<WsMessage>;

pub struct Server {
  clients: HashMap<Uuid, Socket>, //self id to self
}

impl Default for Server {
  fn default() -> Server {
    Server {
      clients: HashMap::new(),
    }
  }
}

impl Server {
  fn send_message(&self, message: &str, id_to: &Uuid) {
    if let Some(socket_recipient) = self.clients.get(id_to) {
      let _ = socket_recipient
        .do_send(WsMessage(message.to_owned()));
    } else {
      println!("attempting to send message but couldn't find user id.");
    }
  }
}

impl Actor for Server {
  type Context = Context<Self>;
}

impl Handler<Disconnect> for Server {
  type Result = ();

  fn handle(&mut self, msg: Disconnect, _: &mut Context<Self>) {
    // if self.sessions.remove(&msg.id).is_some() {
        
    // }
  }
}

impl Handler<Connect> for Server {
  type Result = ();

  fn handle(&mut self, msg: Connect, _: &mut Context<Self>) -> Self::Result {
    self.clients.insert(
      msg.self_id,
      msg.addr,
    );

    self.send_message(&format!("your id is {}", msg.self_id), &msg.self_id);
  }
}

impl Handler<ClientCommand> for Server {
  type Result = ();

  fn handle(&mut self, cmd: ClientCommand, _ctx: &mut Context<Self>) -> Self::Result {
    
  }
}