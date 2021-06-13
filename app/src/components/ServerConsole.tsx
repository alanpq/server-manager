import React from "react";

import './ServerConsole.scss'
import {Message} from "../modals/message";

const formatTimestamp = (timestamp: Date) => {
  return `${("0"+timestamp.getHours()).slice(-2)}:${("0"+timestamp.getMinutes()).slice(-2)}:${("0"+timestamp.getSeconds()).slice(-2)}`
}

function Line(props: {
  msg: Message
}) {
  return <li>
    <span className={`timestamp ${props.msg.msg_type}`}>{formatTimestamp(new Date(props.msg.timestamp))}</span>
    <span className="body">{props.msg.body}</span>
  </li>
}

export function ServerConsole(props: {
  content: Message[],
  onCommand: (cmd: string) => void,
}) {

  return <section className="console">
    <div>
      <ul>
        {
          props.content.map((message, idx) => {
            return <Line key={idx} msg={message}/>
          })
        }
      </ul>
    </div>
    <input onKeyUp={(e) => {
      if(e.key == "Enter") {
        props.onCommand(e.currentTarget.value);
        e.currentTarget.value = "";
      }
    }}/>
  </section>;
}