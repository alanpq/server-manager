import {Server} from "../modals/server";
import React from "react";

export function ServerTabs(props: {
  tabs: string[],
  servers: {[name: string]: Server},
  curTab: number,
  onChange: (new_idx: number) => void,
}) {
  return <nav>
    <button className={props.curTab === -1 ? 'current' : ''} onClick={() => {props.onChange(-1);}}>Dashboard</button>
    {
      props.tabs.map((value, index) => {
        return <button
          className={index === props.curTab ? 'current' : ''}
          onClick={() => {props.onChange(index)}}
          key={index}
        >{props.servers[value].name}</button>
      })
    }
    <span className="flex grow"/>
    <button className="user">Username</button>
  </nav>;
}