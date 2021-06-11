import {Server} from "../modals/server";
import React from "react";

export function ServerDetails(props: {
  server: Server | null,
}) {
  if (props.server === null) {
    return <article className="server-details">

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