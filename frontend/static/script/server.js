const serverConsole = new Console();
const stats = new Stats();
const conn = new Connection();

const getColor = (hue) => {
  return `hsla(${(hue/255)*360}, 100%, 60%, 0.3)`
}

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

conn.onopen = () => {
  // stats.stats.websocket = "CONNECTED";
  serverConsole.input.readOnly = false;
  serverConsole.outputDiv.className = "console";
  setTimeout(() => {
    updateSocketStatus();
    stats.updateStats();
    if(conn.socket.readyState == 1)
      serverConsole.addLine("Connected to Websocket.", "meta");
  }, 500);
  serverConsole.oncommand = (msg) => {
    serverConsole.addLine(msg, "in", getColor(stats.self.hue));
    conn.send(msg)
  };
  conn.sendCmd({
    type: "stats"
  });
  stats.updateStats();
}

conn.onclose = () => {
  const s = stats.stats.websocket;
  updateSocketStatus();
  if(s == "CONNECTED")
    serverConsole.addLine("Websocket connection closed.", "meta");
  else
    serverConsole.addLine("Could not connect to Websocket.", "meta");
  serverConsole.input.readOnly = true;
  serverConsole.outputDiv.className = "console readonly";
  stats.updateStats();
}

conn.ontext = (txt) => {
  serverConsole.addLine(txt, "out", getColor(stats.self.hue));
}

conn.oncmd = (cmd) => {
  console.log(cmd);
  switch(cmd.type) {
    case "Print":
      serverConsole.addLine(cmd.body, "meta");
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
      serverConsole.addLine(cmd.body.cmd, "in", c);
      serverConsole.addLine(cmd.body.out, "out", c);
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