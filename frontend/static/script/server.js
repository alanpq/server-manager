const serverConsole = new Console();
const stats = new Stats();
const conn = new Connection();

const getColor = (hue) => {
  return `hsla(${(hue/255)*360}, 100%, 60%, 0.3)`
}

conn.onopen = () => {
  stats.stats.websocket = "CONNECTED";
  serverConsole.input.readOnly = false;
  serverConsole.outputDiv.className = "console";
  serverConsole.addLine("Connected to Websocket.", "meta");
  serverConsole.oncommand = (msg) => {conn.send(msg)};
  conn.sendCmd({
    type: "stats"
  });
  stats.updateStats();
}

conn.onclose = () => {
  stats.stats.websocket = "DISCONNECTED";
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