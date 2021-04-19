class Stats {
  constructor() {
    this.dom = {
      name: document.getElementById("name"),
      websocket: document.getElementById("ws-status"),
      communicator: document.getElementById("com-status"),
    }
    this.stats = {
      name: "Server",
      communicator: "DISCONNECTED",
      websocket: "DISCONNECTED",
    }
  }

  updateStats() {
    this.dom.name.innerText = this.stats.name;

    this.dom.communicator.innerText = this.dom.communicator.className = this.stats.communicator;
    this.dom.websocket.innerText = this.dom.websocket.className = this.stats.websocket;
  }
}