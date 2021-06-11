import React, {useEffect, useState} from 'react';
import './App.scss';
import {useServerList} from "./websocket/connection_service";
import {Server} from "./modals/server";

function ServerList(props: {
  onOpen?: (server: Server) => void,
  onChange?: (server_id: string) => void,
}) {
  const list = useServerList();
  const [current, setCurrent] = useState(0);

  return <ul className="server-list">
      {
        list.map((srv, index) => {
          return <li
            key={index}
            className={index === current ? 'current' : ''}
            onClick={() => {
              setCurrent(index);
            }}
            onDoubleClick={() => {
              if (props.onOpen)
                props.onOpen(srv)
            }}
          >
            <span title={srv.id}>{srv.name}</span>
            <span>{srv.communicator}</span>
            <span>HI</span>
          </li>
        })
      }
  </ul>;
}

function ServerTabs(props: {
  tabs: string[],
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
        >{value}</button>
      })
    }
    <span className="flex grow"/>
    <button className="user">Username</button>
  </nav>;
}

function ServerDetails() {
  return <article className="server-details">
    <header>
      <h1>CSGO Server</h1>
      <button>EDIT</button>
      <button>SHUTDOWN</button>
      <button>OPEN</button>
      <span className="flex grow"/>
      <button>DELETE</button>
    </header>
  </article>;
}

function ServerConsole() {
  return <section className="console">

  </section>;
}

function App() {
  const [tabs, setTabs]: [string[], any] = useState([]);
  const [tabIdx, setTabIdx] = useState(-1);
  const [serverID, setServerID] = useState(-1); // index of current server (-1 for dashboard)
  return (
    <>
      <header>
        <ServerTabs tabs={tabs} curTab={tabIdx} onChange={(new_tab) => {setTabIdx(new_tab)}}/>
      </header>
      <main>
        <ServerList onOpen={(srv) => {
          setTabIdx(tabs.length);
          setTabs(tabs.concat(srv.name))
        }}/>
        <ServerDetails/>
        <article className="mini-console">
          <ServerConsole />
        </article>
      </main>
    </>
  );
}

export default App;
