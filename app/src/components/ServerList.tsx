import {Server} from "../modals/server";
import {useServerList} from "../websocket/connection_service";
import React, {useState} from "react";

export function ServerList(props: {
  onOpen?: (server: Server) => void,
  onChange?: (server_id: string) => void,
}) {
  const list = useServerList();
  const [current, setCurrent] = useState(-1);

  return <ul className="server-list">
    {
      list.map((srv, index) => {
        return <li
          key={index}
          className={index === current ? 'current' : ''}
          onClick={() => {
            if (props.onChange)
              props.onChange(srv.id);
            setCurrent(index);
          }}
          onDoubleClick={() => {
            if (props.onOpen)
              props.onOpen(srv)
          }}
        >
          <span title={srv.id}>{srv.name}</span>
          <span>{srv.communicator}</span>
          <span>HI</span>
        </li>
      })
    }
  </ul>;
}