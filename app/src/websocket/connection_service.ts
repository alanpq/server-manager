import Connection from "./connection";
import {useEffect, useState} from "react";
import {Identity, Print, ServerList, ServerLog, Status} from "../modals/server_commands";
import {Server} from "../modals/server";
import {Message, MessageType} from "../modals/message";

const listeners: {
  serverList: Set<any>,
  server: {[server_id: string]: Set<any>},
  server_once: {[server_id: string]: Set<any>},
  serverComm: {[server_id: string]: Set<any>},
} = {
  serverList: new Set<any>(),
  server: {},
  server_once: {},
  serverComm: {},
};

const connection = new Connection();
const data: {
  communicator_types: string[],
  servers: {[server_id: string]: Server},
  messages: {[server_id: string]: Message[]},
} = {
  communicator_types: [],
  servers: {},
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

const parseServer = (raw: any): Server => {
  return {
    id: raw.id,
      name: raw.name,
    comm_type: raw.comm_type,
    communicator: raw.communicator,
    settings: Object.entries(raw.settings ?? {}).map(([key, value]: [string, any]) => {
    const spl = key.split('/');
    return {
      type: spl[0],
      name: spl[1],
      value,
    }
  }),
    clients: raw.clients,
  }
}

connection.on_cmd = (cmd: any) => {
  switch (cmd.type) {
    case "Print":
      // TODO: handle Print commands
      break;
    case "Status":
      data.servers[cmd.body.id] = parseServer(cmd.body);
      listeners.server_once[cmd.body.id]?.forEach((cb) => {
        cb(data.servers[cmd.body.id]);
      });
      listeners.server_once[cmd.body.id] = new Set();
      broadcastListeners(listeners.server[cmd.body.id], data.servers[cmd.body.id]);
      broadcastListeners(listeners.serverList, Object.values(data.servers));
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
      data.communicator_types = cmd.body.communicator_types;
      break;
    case "ServerLog":
      data.messages[cmd.body.server_id] = cmd.body.messages; // TODO: handle different pages
      broadcastListeners(listeners.serverComm[cmd.body.server_id], data.messages[cmd.body.server_id]);
      break;
    case "ServerList":
      cmd.body.map((value: any) => {
        return parseServer(value);
      }).forEach((srv: Server) => {
        data.servers[srv.id] = srv;
      });
      broadcastListeners(listeners.serverList, Object.values(data.servers));
      break;
    default:
      console.error(`Failed to parse command of type ${cmd.type} -> ${cmd.body}'`);
      break;
  }
}

export const createServer = () => {
  connection.send_cmd({
    type: "CreateServer"
  })
}

/**
 * Fetches new information on specified server.
 * @param server_id UUID of the server.
 * @param cb Callback for when server fetch completes.
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
    setList(Object.values(data.servers));
    listeners.serverList.add(handleListChange);
    return () => {
      listeners.serverList.delete(handleListChange);
    }
  }, []);

  return list;
}

const registerServerListener = (server_id: string, cb: (server: Server) => void, once?: boolean) => {
  if (once ?? false) {
    if(listeners.server_once[server_id] === undefined)
      listeners.server_once[server_id] = new Set();
    listeners.server_once[server_id].add(cb);
  } else {
    if(listeners.server[server_id] === undefined)
      listeners.server[server_id] = new Set();
    listeners.server[server_id].add(cb);
  }
}

const unregisterServerListener = (server_id: string, cb: (server: Server) => void, once?: boolean) => {
  if (once ?? false)
    listeners.server_once[server_id].delete(cb);
  else
    listeners.server[server_id].delete(cb);
}

export const useServer = (server_id: string | undefined): [Server | null, (srv: Server) => void] => {
  const [server, setServer] = useState<Server | null>(null);
  useEffect(() => {
    function updateServer(newServer: Server) {
      setServer(newServer);
    }
    if (server_id === undefined)
      return () => {};
    else {
      updateServer(data.servers[server_id] ?? null);
      registerServerListener(server_id, updateServer);
      return () => {
        unregisterServerListener(server_id, updateServer);
      }
    }
  }, [server_id, server])
  return [server, server_id ? (srv: Server) => {
    connection.send_cmd({
      type: "UpdateServer",
      body: {
        id: srv.id,
        name: srv.name,
        communicator_type: srv.comm_type,
        settings: srv.settings.reduce((acc: {[id: string]: any}, setting) => {
          acc[`${setting.type}/${setting.name}`] = setting.value;
          return acc;
        }, {}),
      }
    })
  } : () => {}];
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
      if(cmd === "") return;
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

export const useCommTypes = () => {
  return data.communicator_types;
}