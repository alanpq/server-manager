import Connection from "./connection";
import {useEffect, useState} from "react";
import {Identity, Print, ServerList, ServerLog, Status} from "../modals/server_commands";
import {Server} from "../modals/server";
import {Message, MessageType} from "../modals/message";

const listeners: {
  serverList: Set<any>,
  server: Set<any>,
  serverComm: {[server_id: string]: Set<any>},
} = {
  serverList: new Set<any>(),
  server: new Set<any>(),
  serverComm: {},
};

const connection = new Connection();
const data: {
  serverList: any[],
  messages: {[server_id: string]: Message[]},
} = {
  serverList: [],
  messages: {},
};

const broadcastListeners = (listeners: Set<any>, value: any) => {
  if (listeners === undefined) {
    console.error('Listener list is undefined!');
    return;
  }
  listeners.forEach((v) => {
    v(value);
  });
}

connection.on_open = () => {

}

connection.on_cmd = (cmd: any) => {
  switch (cmd.type) {
    case "Print":
      // TODO: handle Print commands
      break;
    case "Status":
      // TODO: handle Status commands
      break;
    case "Command":
      if(data.messages[cmd.body.server] === undefined) {
        data.messages[cmd.body.server] = [];
      }
      data.messages[cmd.body.server].push({
        user: cmd.body.user,
        body: cmd.body.cmd,
        msg_type: MessageType.IN,
        timestamp: Date.now(), // TODO: make this not bad
      });
      data.messages[cmd.body.server].push({
        user: cmd.body.user,
        body: cmd.body.out,
        msg_type: MessageType.OUT,
        timestamp: Date.now(), // TODO: make this not bad
      });
      broadcastListeners(listeners.serverComm[cmd.body.server], data.messages[cmd.body.server]);
      break;
    case "Identity":
      connection.send_cmd({type: "ListServers"});
      break;
    case "ServerLog":
      data.messages[cmd.body.server_id] = cmd.body.messages; // TODO: handle different pages
      broadcastListeners(listeners.serverComm[cmd.body.server_id], data.messages[cmd.body.server_id]);
      break;
    case "ServerList":
      data.serverList = cmd.body;
      broadcastListeners(listeners.serverList, cmd.body);
      break;
    default:
      console.error(`Failed to parse command of type ${cmd.type} -> ${cmd.body}'`);
      break;
  }
}

/**
 * Fetches new information on specified server.
 * @param server_id UUID of the server
 */
export const fetchServer = (server_id: string | undefined) => {
  if (server_id === undefined) return;
  connection.send_cmd({
    type: "Status",
    body: server_id,
  });
  connection.send_cmd({
    type: "ServerLog",
    body: {
      id: server_id
    },
  });
}

export const useServerList = () => {
  const [list, setList]: [Server[], any] = useState([]);

  useEffect(() => {
    function handleListChange(newList: Server[]) {
      setList(newList)
    }
    setList(data.serverList);
    listeners.serverList.add(handleListChange);
    return () => {
      listeners.serverList.delete(handleListChange);
    }
  }, []);

  return list;
}

export const useServer = (server_id: string) => {

}

export const useServerComms = (server_id: string | undefined): [Message[], (cmd: string) => void] => {
  const [lines, setLines] = useState<Message[]>([]);

  useEffect(() => {
    function handleIn(newLines: Message[]) {
      setLines(newLines.slice());
    }
    if (server_id === undefined) {
        return () => {};
    } else {
      if (listeners.serverComm[server_id] === undefined)
        listeners.serverComm[server_id] = new Set();
      listeners.serverComm[server_id].add(handleIn);
      return () => {
        listeners.serverComm[server_id].delete(handleIn);
      }
    }
  }, [server_id, lines]);

  if (server_id === undefined) {
    return [lines, ()=>{}];
  } else {
    return [lines, (cmd: string) => {
      connection.send_cmd({
        type: "Command",
        body: {
          id: server_id,
          cmd
        }
      });
    }];
  }
}