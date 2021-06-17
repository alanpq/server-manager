import {Server} from "../modals/server";
import React, {useEffect, useState} from "react";
import {ServerList} from "./ServerList";
import {ServerDetails} from "./ServerDetails";
import {ServerConsole} from "./ServerConsole";

import './Dashboard.scss';
import {fetchServer, useServer, useServerComms} from "../websocket/connection_service";

export function Dashboard(props: {
  onOpen: (server: Server) => void,
  servers: { [p: string]: Server },
}) {
  const [id, setId] = useState<string>();
  const [server, setServer] = useServer(id);

  // @ts-ignore
  const [lines, sendCmd] = useServerComms(server?.id);

  // useEffect(() => {
  //   // @ts-ignore
  // }, [server]);

  return <main className="dashboard">
    <ServerList
      onOpen={props.onOpen}
      onChange={(id) => {
        setId(id);
        console.log(id);
        fetchServer(id);
      }}
    />
    <ServerDetails server={server} onEdit={(value) => {
      Object.assign(server, value);
      if (server !== null)
        setServer(server);
    }}/>
    <article className="mini-console">
      {/*<ServerConsole content={lines} onCommand={sendCmd}/>*/}
    </article>
  </main>;
}