pub mod csgo;
use serde::{Serialize, Deserialize};
use crate::communicator::Communicator;
use crate::communicators::csgo::CSGORcon;
use crate::server::BoxedCommunicator;

/* TODO: find a better alternative to hardcoding CommunicatorType
  Ideally the enum could be generated at compile time by looking at all communicator structs.
  Might be doable with procedural macros but I haven't touched those at all.
 */

#[derive(Debug)]
#[derive(Serialize, Deserialize)]
#[derive(Clone, Copy)]
#[derive(EnumVariantNames)]
#[strum(serialize_all = "PascalCase")]
pub enum CommunicatorType {
  None,
  #[strum(serialize="CSGO")]
  CSGO,
}

pub fn generate_communicator(comm_type: &CommunicatorType) -> Option<BoxedCommunicator> {
  match comm_type {
    CommunicatorType::None => {
      None
    },
    CommunicatorType::CSGO => {
     Some(Box::new(CSGORcon::new()))
    },
  }
}