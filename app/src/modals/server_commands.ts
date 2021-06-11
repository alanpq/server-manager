import {Server} from "./server";
import {Client} from "./client";
import {Message} from "./message";

export interface Status {
  server_info: Server,
};

export interface Print {
  text: String,
}

export interface ForeignCommand {
  id: string,
  cmd: string,
  out: string,
}

export interface Identity {
  client: Client,
}

export interface ServerLog {
  page_no: number,
  messages: Message[],
  server_id: string,
}

export interface ServerList {
  servers: Server[],
}