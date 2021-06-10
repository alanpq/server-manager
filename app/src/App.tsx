import React from 'react';
import logo from './logo.svg';
import './App.scss';

function App() {
  return (
    <>
      <header>
        <nav>
          <button className="current" >Dashboard</button>
          <button>server 1</button>
          <button>server 2</button>
          <span className="flex grow"/>
          <button className="user">Username</button>
        </nav>
      </header>
      <main>
        <article className="server-list">
          <span>CSGO Server</span>
          <span>CSGO RCON</span>
          <span>Online</span>
          <span>Minecraft Server</span>
          <span>Minecraft RCON</span>
          <span>Online</span>
          <span>FNAF 9 Server</span>
          <span>Generic RCON</span>
          <span>Online</span>
        </article>
        <article className="server-details">
          <header>
            <h1>CSGO Server</h1>
            <button>EDIT</button>
            <button>SHUTDOWN</button>
            <button>OPEN</button>
            <span className="flex grow"/>
            <button>DELETE</button>
          </header>
        </article>
        <article className="mini-console">
          <section className="console">

          </section>
        </article>
      </main>
      </>
  );
}

export default App;
