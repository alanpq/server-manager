import React from "react";

import './ServerConsole.scss'
import {Message} from "../modals/message";

function Line(props: {
  msg: Message
}) {
  return <li>
    <span className={`timestamp ${props.msg.msg_type}`}>{props.msg.timestamp}</span>
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