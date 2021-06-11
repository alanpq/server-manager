import React, {useEffect, useState} from 'react';
import './App.scss';
import {useServerList} from "./websocket/connection_service";
import {Server} from "./modals/server";
import {ServerDetails} from "./components/ServerDetails";
import {ServerConsole} from "./components/ServerConsole";
import {ServerList} from "./components/ServerList";
import {ServerTabs} from "./components/ServerTabs";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
  useHistory,
} from "react-router-dom";

function Dashboard(props: {
  onOpen: (server: Server) => void,
  servers: { [p: string]: Server },
}) {
  const [server, setServer]: [Server | null, any] = useState(null);
  return <main>
    <ServerList
      onOpen={props.onOpen}
      onChange={(id) => {
        setServer(props.servers[id]);
        console.log(id);
      }}
    />
    <ServerDetails server={server}/>
    <article className="mini-console">
      <ServerConsole/>
    </article>
  </main>;
}

function ServerView() {
  const {id} = useParams<any>();
  return <main>
    hi :)
    {id}
  </main>
}

function App() {
  const [servers, setServers]: [{[name: string]: Server}, any] = useState({});
  const [tabs, setTabs]: [string[], any] = useState([]);
  const [tabIdx, setTabIdx] = useState(-1);

  const list = useServerList();

  useEffect(() => {
    setServers((list as any).reduce((result:{[name: string]: Server}, server: Server) => {
      result[server.id] = server;
      return result;
    }, {}));
  }, [list]);

  return (
    <>
      <Router>
        <header>
          <ServerTabs tabs={tabs} servers={servers} curTab={tabIdx} onChange={(new_tab) => {
            setTabIdx(new_tab)
          }}/>
        </header>
        <Switch>
          <Route path="/dashboard">
            <Dashboard servers={servers}
              onOpen={(srv) => {
                const idx = tabs.indexOf(srv.id);
                if (idx !== -1) {
                  setTabIdx(idx);
                } else {
                  setTabIdx(tabs.length);
                  setTabs(tabs.concat(srv.id));
                }
              }}
            />
          </Route>
          <Route path="/server/:id" children={<ServerView />}/>
        </Switch>
      </Router>
    </>
  );
}

export default App;
