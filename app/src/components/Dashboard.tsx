import {Server} from "../modals/server";
import React, {useState} from "react";
import {ServerList} from "./ServerList";
import {ServerDetails} from "./ServerDetails";
import {ServerConsole} from "./ServerConsole";

import './Dashboard.scss';

export function Dashboard(props: {
  onOpen: (server: Server) => void,
  servers: { [p: string]: Server },
}) {
  const [server, setServer]: [Server | null, any] = useState(null);
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
      <ServerConsole/>
    </article>
  </main>;
}