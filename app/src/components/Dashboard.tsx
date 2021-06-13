import {Server} from "../modals/server";
import React, {useEffect, useState} from "react";
import {ServerList} from "./ServerList";
import {ServerDetails} from "./ServerDetails";
import {ServerConsole} from "./ServerConsole";

import './Dashboard.scss';
import {fetchServer, useServerComms} from "../websocket/connection_service";

export function Dashboard(props: {
  onOpen: (server: Server) => void,
  servers: { [p: string]: Server },
}) {
  const [server, setServer]: [Server | null, any] = useState(null);

  // @ts-ignore
  const [lines, sendCmd] = useServerComms(server?.id);

  useEffect(() => {
    // @ts-ignore
    fetchServer(server?.id);
  }, [server]);

  return <main>
    <ServerList
      onOpen={props.onOpen}
      onChange={(id) => {
        setServer(props.servers[id]);
        console.log(id);
      }}
    />
    <ServerDetails server={server}/>
    <article className="mini-console">
      <ServerConsole content={lines} onCommand={sendCmd}/>
    </article>
  </main>;
}