pub mod csgo;
use serde::{Serialize, Deserialize};

#[derive(Debug)]
#[derive(Serialize, Deserialize)]
pub enum CommunicatorType {
  CSGO,
}