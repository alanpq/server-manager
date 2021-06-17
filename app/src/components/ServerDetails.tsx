import {Server} from "../modals/server";
import React, {ChangeEvent, useEffect, useState} from "react";

import './ServerDetails.scss'
import {useCommTypes} from "../websocket/connection_service";

export function ServerDetails(props: {
  server: Server | null,
  onEdit: (value: any) => void,
}) {

  const [data, setData] = useState<{[name: string]: any}>({
    name: "",
    communicator_type: "None",
  });

  useEffect(() => {
    if(props.server !== null) {
      setData({
        name: props.server.name,
        comm_type: props.server.comm_type,
      });
    }
  }, [props.server]);

  const commTypes = useCommTypes();

  const _handleInput = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    data[event.target.name] = event.target.value;
    setData(data);
    const obj: any = {};
    obj[event.target.name] = event.target.value;
    props.onEdit(obj);
  };

  if (props.server === null) {
    return <article className="server-details">
    </article>
  } else {
    return <article className="server-details">
      <header>
        {/*FIXME: debounce all of these inputs*/}
        <input name="name" value={data.name} onChange={_handleInput}/>
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
            <select name="comm_type" value={data.comm_type} onChange={_handleInput}>
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