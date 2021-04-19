const serverConsole = new Console();
const stats = new Stats();
const conn = new Connection();

conn.onopen = () => {
  stats.stats.websocket = "DISCONNECTED";
  serverConsole.addLine("Connected to Websocket.", "meta");
  serverConsole.oncommand = (msg) => {conn.send(msg)};
  conn.sendCmd({
    type: "stats"
  });
  stats.updateStats();
}

conn.onclose = () => {
  stats.stats.websocket = "DISCONNECTED";
  stats.updateStats();
}

conn.ontext = (txt) => {
  serverConsole.addLine(txt);
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

    default:
      console.error("unexpected command received:")
      console.error(cmd);
    break;
  }
  stats.updateStats();
}

window.onload = () => {
  serverConsole.init();
  stats.stats.websocket = "CONNECTING";
  conn.init();
  stats.updateStats();
}