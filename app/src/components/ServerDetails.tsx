import {Server} from "../modals/server";
import React from "react";

import './ServerDetails.scss'
import {useCommTypes} from "../websocket/connection_service";

export function ServerDetails(props: {
  server: Server | null,
}) {
  const commTypes = useCommTypes();
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
      <section className="settings">
        <ul>
          <li>
            <span>Communicator Type</span>
            <select value={props.server.comm_type}>
              {
                // TODO: custom <select> dropdown
                commTypes.map((v, idx) => {
                  return <option key={idx} value={v}>
                    {v}
                  </option>
                })
              }
            </select>
          </li>
          {props.server.settings &&
          props.server.settings.map((v, idx) => {
            return <li key={idx}>
              <span>{v.name}</span>
              <input
                type={v.type}
                defaultValue={v.value}
                placeholder={
                  !v.value ? (v.type === "password" ? "hidden" : "empty") : ""
                }
              />
            </li>;
          })
          }
        </ul>
      </section>
      <section className="stats">
        <ul>
          <li>
            <span>Communicator Status</span>
            <span>{props.server.communicator}</span>
          </li>
        </ul>
      </section>
    </article>;
  }
}