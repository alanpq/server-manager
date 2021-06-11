import React, {useEffect, useState} from 'react';
import './App.scss';
import {useServerList} from "./websocket/connection_service";
import {Server} from "./modals/server";

function ServerList(props: {
  onOpen?: (server: Server) => void,
  onChange?: (server_id: string) => void,
}) {
  const list = useServerList();
  const [current, setCurrent] = useState(-1);

  return <ul className="server-list">
      {
        list.map((srv, index) => {
          return <li
            key={index}
            className={index === current ? 'current' : ''}
            onClick={() => {
              if (props.onChange)
                props.onChange(srv.id);
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

function ServerDetails(props: {
  server: Server | null,
}) {
  if (props.server === null) {
    return <article className="server-details">

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
    </article>;
  }
}

function ServerConsole() {
  return <section className="console">

  </section>;
}

function App() {
  const [servers, setServers]: [{[name: string]: Server}, any] = useState({});
  const [tabs, setTabs]: [string[], any] = useState([]);
  const [tabIdx, setTabIdx] = useState(-1);

  const [server, setServer]: [Server | null, any] = useState(null);

  const list = useServerList();

  useEffect(() => {
    setServers((list as any).reduce((result:{[name: string]: Server}, server: Server) => {
      result[server.id] = server;
      return result;
    }, {}));
  }, [list]);

  return (
    <>
      <header>
        <ServerTabs tabs={tabs} servers={servers} curTab={tabIdx} onChange={(new_tab) => {setTabIdx(new_tab)}}/>
      </header>
      <main>
        <ServerList
          onOpen={(srv) => {
            const idx = tabs.indexOf(srv.id);
            if (idx !== -1) {
              setTabIdx(idx);
            } else {
              setTabIdx(tabs.length);
              setTabs(tabs.concat(srv.id))
            }
          }}
          onChange={(id) => {
            setServer(servers[id]);
            console.log(id);
          }}
        />
        <ServerDetails server={server}/>
        <article className="mini-console">
          <ServerConsole />
        </article>
      </main>
    </>
  );
}

export default App;
