import React, {useEffect, useState} from 'react';
import './App.scss';

function ServerList() {
  return <article className="server-list">
    <span>CSGO Server</span>
    <span>CSGO RCON</span>
    <span>Online</span>
    <span>Minecraft Server</span>
    <span>Minecraft RCON</span>
    <span>Online</span>
    <span>FNAF 9 Server</span>
    <span>Generic RCON</span>
    <span>Online</span>
  </article>;
}

function ServerTabs(props: { tabs: {id: string, name: string}[], onChange?: (new_id: string) => void }) {
  const [tabIdx, setTabIdx] = useState(-1);

  useEffect(() => {
    if (props.onChange) {
      props.onChange(tabIdx !== -1 ? props.tabs[tabIdx].id : "");
    }
  }, [tabIdx]);

  return <nav>
    <button className={tabIdx === -1 ? 'current' : ''} onClick={() => {setTabIdx(-1)}}>Dashboard</button>
    {
      props.tabs.map((value, index) => {
        return <button
          className={index === tabIdx ? 'current' : ''}
          onClick={() => {setTabIdx(index)}}
          key={value.id}
        >{value.name}</button>
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
  const [tabs, setTabs] = useState([
    {id: "abc", name: "boobies"},
    {id: "def", name: "yummy"},
  ]);
  const [serverID, setServerID] = useState(-1); // index of current server (-1 for dashboard)
  return (
    <>
      <header>
        <ServerTabs tabs={tabs} onChange={(new_id) => {console.log(new_id)}}/>
      </header>
      <main>
        <ServerList/>
        <ServerDetails/>
        <article className="mini-console">
          <ServerConsole />
        </article>
      </main>
    </>
  );
}

export default App;
