import React, {useEffect, useState} from 'react';
import './App.scss';
import {useServerList} from "./websocket/connection_service";
import {Server} from "./modals/server";
import {ServerDetails} from "./components/ServerDetails";
import {ServerConsole} from "./components/ServerConsole";
import {ServerList} from "./components/ServerList";
import {ServerTabs} from "./components/ServerTabs";

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
