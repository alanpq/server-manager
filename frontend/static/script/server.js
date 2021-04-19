const serverConsole = new Console();
const stats = new Stats();
const conn = new Connection();

conn.onopen = () => {
  serverConsole.addLine("Connected to Websocket.", "meta");
  serverConsole.oncommand = (msg) => {conn.send(msg)};
  conn.sendCmd({
    type: "stats"
  });
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
      stats.stats = cmd.body;
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
  conn.init();
}