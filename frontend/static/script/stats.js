class Stats {
  constructor() {
    this.dom = {
      name: document.getElementById("name")
    }
    this.stats = {
      name: "Server name :)",
    }
  }

  updateStats() {
    this.dom.name.innerText = this.stats.name;
  }
}