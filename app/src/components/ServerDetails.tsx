import {Server} from "../modals/server";
import React from "react";

import './ServerDetails.scss'

export function ServerDetails(props: {
  server: Server | null,
}) {
  if (props.server === null) {
    return <article className="server-details">
      <p>Select a server from the list.</p>
    </article>
  } else {
    return <article className="server-details">
      <header>
        <h1>{props.server.name}</h1>
        <button>EDIT</button>
        <button>SHUTDOWN</button>
        <button>OPEN</button>
        <span className="flex grow"/>
        <button>DELETE</button>
      </header>
    </article>;
  }
}