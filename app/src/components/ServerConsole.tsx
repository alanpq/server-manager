import React, {useEffect, useRef} from "react";

import './ServerConsole.scss'
import {Message, MessageType} from "../modals/message";

const formatTimestamp = (timestamp: Date) => {
  return `${("0"+timestamp.getHours()).slice(-2)}:${("0"+timestamp.getMinutes()).slice(-2)}:${("0"+timestamp.getSeconds()).slice(-2)}`
}

const hashCode = (str: string) => { // java String#hashCode
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

const intToRGB = (i: number) => {
  var c = (i & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
}

const getColor = (user: string) => {
  return intToRGB(hashCode(user));
}

function Line(props: {
  msg: Message
}) {
  const color = `#${getColor(props.msg.user)}22`;
  return <li className={props.msg.msg_type == MessageType.IN ? 'in' : 'out'}>
    <span style={{
      backgroundColor: color,
    }} className="timestamp">{formatTimestamp(new Date(props.msg.timestamp))}</span>
    <span style={{
      backgroundColor: color,
    }} className="body" title={props.msg.user ?? ""}>{props.msg.body}</span>
  </li>
}

export function ServerConsole(props: {
  content: Message[],
  onCommand: (cmd: string) => void,
}) {
  const contentEl = useRef(null);
  useEffect(() => {
    // @ts-ignore
    contentEl?.current.scrollTo(0, contentEl?.current.scrollHeight);
  }, [props.content]);

  return <section className="console">
    <div ref={contentEl}>
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