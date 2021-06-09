class Stats {
  constructor() {
    this.dom = {
      stats: document.querySelector(".stats"),
      name: document.getElementById("name"),
      websocket: document.getElementById("ws-status"),
      communicator: document.getElementById("com-status"),
      clients: document.getElementById("clients"),
      preSettings: document.getElementById("clients"),
      settings: [],
      label: document.createElement("label"),
      input: document.createElement("input"),
    }
    this.stats = {
      name: "Server",
      communicator: "DISCONNECTED",
      websocket: "DISCONNECTED",
      clients: {},
      settings: {},
    }
  }

  updateStats() {
    this.dom.name.innerText = this.stats.name;

    this.dom.communicator.innerText = this.dom.communicator.className = this.stats.communicator;
    this.dom.websocket.innerText = this.dom.websocket.className = this.stats.websocket;

    this.dom.clients.innerHTML = Object.values(this.stats.clients).reduce((acc, current) => {
      return `${acc}<li>${current.name}</li>`;
    }, "");

    if(this.stats.settings) {
      const k = Object.keys(this.stats.settings);
      for(let i = 0; i < k.length; i++) {
        const split = k[i].split('/');
        if(this.dom.settings[i]) {
          this.dom.settings[i][0].innerText = split[0];
          this.dom.settings[i][1].type = split[1];
        } else {
          const label = this.dom.label.cloneNode(false);
          const input = this.dom.input.cloneNode(false);

          input.type = split[1];

          label.innerText = split[0];
          input.value = this.stats.settings[k[i]];

          this.dom.settings[i] = [label, input];

          this.dom.stats.insertBefore(label, this.dom.preSettings);
          this.dom.stats.insertBefore(input, this.dom.preSettings);
        }
      }
      if(k.length < this.dom.settings.length) {
        for(let i = k.length; i < this.dom.settings.length; i++) {
          this.dom.settings[i][0].remove();
          this.dom.settings[i][1].remove();
          delete this.dom.settings[i];
        }
      }
    } else if(this.dom.settings) {
      for(let i = 0; i < this.dom.settings.length; i++) {
        if(!this.dom.settings[i]) continue; // TODO: investigate this, this check shouldnt be needed
        this.dom.settings[i][0].remove();
        this.dom.settings[i][1].remove();
        delete this.dom.settings[i];
      }
    }
  }
}