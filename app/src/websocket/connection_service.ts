import Connection from "./connection";
import {useEffect, useState} from "react";
import {ForeignCommand, Identity, Print, ServerList, ServerLog, Status} from "../modals/server_commands";
import {Server} from "../modals/server";

const listeners = {
  serverList: new Set<any>(),
  server: new Set<any>(),
  serverComm: new Set<any>(),
};

const connection = new Connection();

connection.on_open = () => {

}

connection.on_cmd = (cmd: any) => {
  switch (cmd.type) {
    case "Print":
      return {
        text: cmd.body,
      } as Print
    case "Status":
      return {
        server_info: cmd.body
      } as Status
    case "ForeignCommand":
      return {
        id: cmd.body.id,
        cmd: cmd.body.cmd,
        out: cmd.body.out,
      } as ForeignCommand
    case "Identity":
      connection.send_cmd({type: "ListServers"});
      break;
    case "ServerLog":
      return {
        page_no: cmd.body.page_no,
        messages: cmd.body.messages,
        server_id: cmd.body.server_id,
      } as ServerLog
    case "ServerList":
      listeners.serverList.forEach(fn => {
        fn(cmd.body);
      });
      break;
    default:
      console.error(`Failed to parse command of type ${cmd.type} -> ${cmd.body}'`);
      break;
  }
}

export const useServerList = () => {
  const [list, setList]: [Server[], any] = useState([]);

  useEffect(() => {
    function handleListChange(newList: Server[]) {
      setList(newList)
    }
    listeners.serverList.add(handleListChange);
    return () => {
      listeners.serverList.delete(handleListChange);
    }
  });

  return list;
}

export const useServer = (server_id: String) => {

}

export const useServerComms = (server_id: String) => {

}