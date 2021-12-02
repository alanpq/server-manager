import React, {useEffect, useRef} from "react";

import './ServerConsole.scss'
import {Message, MessageType} from "../modals/message";

const formatTimestamp = (timestamp: Date) => {
  return `${("0"+timestamp.getHours()).slice(-2)}:${("0"+timestamp.getMinutes()).slice(-2)}:${("0"+timestamp.getSeconds()).slice(-2)}`
}

const hashCode = (str: string) => { // java String#hashCode
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

const intToRGB = (i: number) => {
  const c = (i & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
}

const colorMap = ["black", "dark_blue", "dark_green", "dark_aqua", "dark_red", "dark_purple", "gold", "gray", "dark_gray", "blue", "green", "aqua", "red", "light_purple", "yellow", "white", "", "", "", "", "obfuscate", "bold", "strike", "underline", "italic"];

const colorToClass = (color: string) => {
  const v = color.charCodeAt(0);
  if (v >= 48 && v <= 57) {
    return colorMap[v-48];
  } else if (v >= 97 && v <= 102) {
    return colorMap[v-97];
  }
  return "";
}

const parseColors = (msg: string) => {
  let chunks = msg.split("§");
  let final = [];
  let class_buf = [];
  for(let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    if (i == 0 && msg[0] !== "§") {
      final.push(c);
      continue;
    }
    class_buf.push(colorToClass(c));
    if (c.length > 1) {
      final.push(`<span class="${class_buf.join(' ')}">${c.slice(1)}</span>`)
      class_buf = [];
    }
  }
  return final.join("");
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
}} className="body" title={props.msg.user ?? ""} dangerouslySetInnerHTML={{__html: parseColors(props.msg.body)}}/>
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