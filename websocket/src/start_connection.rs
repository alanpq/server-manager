use crate::ws::WsConn;
use crate::lobby::Lobby;
use actix::Addr;
use actix_web::{get, web::Data, web::Path, web::Payload, Error, HttpResponse, HttpRequest};
use actix_web_actors::ws;
use uuid::Uuid;


// #[get("/{group_id}")]
#[get("/")]
pub async fn start_connection(
    req: HttpRequest,
    stream: Payload,
    srv: Data<Addr<Lobby>>,
) -> Result<HttpResponse, Error> {
    let ws = WsConn::new(
        Uuid::new_v4(),
        srv.get_ref().clone(),
    );
    println!("incoming req");

    let resp = ws::start(ws, &req, stream);
    resp
}