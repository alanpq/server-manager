class Stats {
  constructor() {
    this.dom = {
      name: document.getElementById("name"),
      websocket: document.getElementById("ws-status"),
      communicator: document.getElementById("com-status"),
      clients: document.getElementById("clients"),
    }
    this.stats = {
      name: "Server",
      communicator: "DISCONNECTED",
      websocket: "DISCONNECTED",
      clients: {},
    }
  }

  updateStats() {
    this.dom.name.innerText = this.stats.name;

    this.dom.communicator.innerText = this.dom.communicator.className = this.stats.communicator;
    this.dom.websocket.innerText = this.dom.websocket.className = this.stats.websocket;

    this.dom.clients.innerHTML = Object.values(this.stats.clients).reduce((acc, current) => {
      return `${acc}<li>${current.name}</li>`;
    }, "");
  }
}