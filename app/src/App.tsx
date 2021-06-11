import React, {useEffect, useState} from 'react';
import './App.scss';
import {useServerList} from "./websocket/connection_service";
import {Server} from "./modals/server";
import {ServerTabs} from "./components/ServerTabs";
import {BrowserRouter as Router, Route, Switch,} from "react-router-dom";
import {Dashboard} from "./components/Dashboard";
import {ServerView} from "./components/ServerView";

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
