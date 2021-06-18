import {Server} from "../modals/server";
import React, {ChangeEvent, useEffect, useState} from "react";

import './ServerDetails.scss'
import {connectServer, disconnectServer, useCommTypes} from "../websocket/connection_service";

export function ServerDetails(props: {
  server: Server | null,
  onEdit: (value: any) => void,
}) {

  const [name, setName] = useState<string>("");
  const [comm, setComm] = useState<string>("");
  const [data, setData] = useState<{[name: string]: any}>({});

  useEffect(() => {
    if(props.server !== null) {
      setName(props.server.name)
      setComm(props.server.comm_type)
      // @ts-ignore
      console.log(props.server.settings);
      setData(props.server.settings.reduce((acc: {[name: string]: any}, val) => {
        if(val.type !== "password")
          acc[val.name] = val.value;
        else
          acc[val.name] = data[val.name]
        return acc;
      }, {}));
    }
  }, [props.server]);

  const commTypes = useCommTypes();

  const _handleInput = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    data[event.target.name] = event.target.value;
    setData(data);
    console.log(event.target.value);
    props.onEdit({settings: {[event.target.type + '/' + event.target.name]: event.target.value}});
  };

  if (props.server === null) {
    return <article className="server-details">
    </article>
  } else {
    return <article className="server-details">
      <header>
        {/*FIXME: debounce all of these inputs*/}
        <input name="name" value={name} onChange={e=>{
          setName(e.target.value);
          props.onEdit({name: e.target.value});
        }}/>
        <button>EDIT</button>
        <button onClick={() => {
          if (props.server?.communicator === "CONNECTED") {
            disconnectServer(props.server?.id);
          } else {
            connectServer(props.server?.id);
          }
        }}>{(props.server.communicator === "CONNECTED") ? "DISCONNECT" : "CONNECT"}</button>
        <button>OPEN</button>
        <span className="flex grow"/>
        <button>DELETE</button>
      </header>
      <section className="settings">
        <ul>
          <li>
            <span>Communicator Type</span>
            <select name="comm_type" value={comm} onChange={e=>{
              setComm(e.target.value);
              props.onEdit({comm_type: e.target.value});
            }}>
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
                name={v.name}
                value={data[v.name] ?? ""}
                placeholder={
                  v.type === "password" ? "hidden" : "empty"
                }
                onChange={_handleInput}
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