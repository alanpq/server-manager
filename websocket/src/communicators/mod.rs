pub mod csgo;
use serde::{Serialize, Deserialize};

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