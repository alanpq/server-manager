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
      <section className="stats">
        <ul>
          <li>
            <span>Communicator Status</span>
            <span>{props.server.communicator}</span>
          </li>
          {props.server.settings &&
              props.server.settings.map((value: any, idx: any) => {
                return <li key={idx}>
                <span>{value}</span>
                <span></span>
                </li>;
              })
          }
        </ul>
      </section>
    </article>;
  }
}