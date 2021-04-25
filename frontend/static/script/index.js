const serverConsole = new Console();
const stats = new Stats();
const conn = new Connection();

const getColor = (hue) => {
  return `hsla(${(hue/255)*360}, 100%, 60%, 0.3)`
}

const state = {
  servers: {},
  curSrv: undefined, // current server id
  dom: {
    serverTab: undefined,

    tabs: document.querySelector("nav"),
    addButton: document.querySelector("nav a.new"),
  },
};

state.dom.serverTab = document.createElement('a');

const socketStates = [
  "CONNECTING",
  "CONNECTED",
  "DISCONNECTED",
  "DISCONNECTED"
];
const updateSocketStatus = () => {
  if(!conn.socket) {
    stats.stats.websocket = "CONNECTING";
    return;
  }
  stats.stats.websocket = socketStates[conn.socket.readyState];
}

// timestamp bug will get fixed once i do serverside timestamping
const redrawConsole = () => {
  serverConsole.log.innerHTML = "";
  const srv = state.servers[state.curSrv];
  for(let i = 0; i < srv.log.length; i++) {
    addLine(srv.log[i][0], srv.log[i][1], srv.log[i][2], false);
  }
}

const addLine = (txt, className, color, firstTime=true) => {
  if(firstTime) {
    if(className == "meta") { // meta messages arent specific to any 1 server
      Object.values(state.servers).forEach((srv) => {
        srv.log.push([txt, className, color]);
      })
    } else {
      state.servers[state.curSrv].log.push([txt, className, color]);
    }
  }
  serverConsole.addLine(txt, className, color);
}

conn.onopen = () => {
  // stats.stats.websocket = "CONNECTED";
  serverConsole.input.readOnly = false;
  serverConsole.outputDiv.className = "console";
  setTimeout(() => {
    updateSocketStatus();
    stats.updateStats();
    if(conn.socket.readyState == 1)
      addLine("Connected to Websocket.", "meta");
  }, 500);
  serverConsole.oncommand = (msg) => {
    if (state.curSrv === undefined) return;
    addLine(msg, "in", getColor(stats.self.hue));
    conn.sendCmd({
      type: "Command",
      body: {
        id: state.curSrv,
        cmd: msg
      }
    })
  };
  conn.sendCmd({
    type: "ListServers"
  });
  stats.updateStats();
}

conn.onclose = () => {
  const s = stats.stats.websocket;
  updateSocketStatus();
  if(s == "CONNECTED")
    addLine("Websocket connection closed.", "meta");
  else
    addLine("Could not connect to Websocket.", "meta");
  serverConsole.input.readOnly = true;
  serverConsole.outputDiv.className = "console readonly";
  stats.updateStats();
}

conn.ontext = (txt) => {
  addLine(txt, "out", getColor(stats.self.hue));
}

conn.oncmd = (cmd) => {
  console.log(cmd);
  switch(cmd.type) {
    case "Print":
      addLine(cmd.body, "meta");
    break;

    case "Status":
      Object.assign(stats.stats, cmd.body);
      stats.updateStats();
    break;

    case "Identity":
      stats.self = cmd.body;
      stats.updateStats();
    break;

    case "ForeignCommand":
      const c = getColor(stats.stats.clients[cmd.body.id].hue);
      addLine(cmd.body.cmd, "in", c);
      addLine(cmd.body.out, "out", c);
    break;

    case "ServerList":
      for(let i = 0; i < cmd.body.length; i++) { // TODO: handle server deletion
        const srv = cmd.body[i];
        if(state.servers[srv.id] !== undefined)
          srv.log = state.servers[srv.id].log;
        else
          srv.log = []
        state.servers[srv.id] = srv;

        if(state.curSrv === undefined) state.curSrv = srv.id;
        if(srv.tab !== undefined) { // update existing server
          // TODO: add server tab updating
        } else { // add new server
          const el = state.dom.serverTab.cloneNode(false);
          el.innerText = srv.name;
          if(srv.id == state.curSrv)
            el.className = "active";

          el.addEventListener("click", (e) => { // TODO: debounce this to avoid spam
            if(state.curSrv != srv.id) {
              state.servers[state.curSrv].tab.className = "";
              el.className = "active";
              conn.sendCmd({
                type: "Status",
                body: srv.id
              })
              state.curSrv = srv.id;
              redrawConsole();
            }
            state.curSrv = srv.id;
            e.preventDefault();
          }, false);
          
          srv.tab = el;
          state.dom.tabs.insertBefore(el, state.dom.addButton);
        }
      }

      
      conn.sendCmd({
        type: "Status",
        body: state.curSrv
      });
    break;

    default:
      console.error("unexpected command received:")
      console.error(cmd);
    break;
  }
  stats.updateStats();
}

window.onload = () => {
  serverConsole.init();
  updateSocketStatus();
  // stats.stats.websocket = "CONNECTING";
  conn.init();
  stats.updateStats();
}

state.dom.addButton.addEventListener("click", (e) => {
  console.log('requesting new server...');
  conn.sendCmd({
    type: "CreateServer"
  })
  e.preventDefault();
}, false);