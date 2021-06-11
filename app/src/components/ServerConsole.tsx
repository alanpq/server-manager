import React from "react";

import './ServerConsole.scss'

function Line() {
  return <li>
    <span className="timestamp">08:46</span>
    <span className="body">{Math.random()}</span>
  </li>
}

export function ServerConsole() {

  return <section className="console">
    <div>
      <ul>
        {
          new Array<boolean>(30).fill(false).map((value, idx) => {
            return <Line />
          })
        }
      </ul>
    </div>
    <input/>
  </section>;
}