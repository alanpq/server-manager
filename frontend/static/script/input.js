const formatTimestamp = (timestamp) => {
  return `${("0"+timestamp.getHours()).slice(-2)}:${("0"+timestamp.getMinutes()).slice(-2)}:${("0"+timestamp.getSeconds()).slice(-2)}`
}



class Console {
  constructor() {
    this.initialized = false;
  }

  init() {
    this.input = document.querySelector("textarea.console");
    this.log = document.querySelector(".output");
    this.outputDiv = document.querySelector("div.console");
    this.caret = document.querySelector("div.console .caret");
    this.selection = document.querySelector("div.console .selection");
    this.output = document.querySelector("div.console .content");
    this.dropdown = document.querySelector("div.console .dropdown");

    this.mouseDown = false;
    this.oncommand = () => {}; // made to be overwritten by websocket events

    this.addEventListeners();
    this.charW = this.getCharWidth();
    this.initialized = true;
  }

  getCharWidth(font) { // creates temp element to measure width of 1 character
    const txt = document.createElement("span");
    this.outputDiv.appendChild(txt);
    txt.id = "bruh";
    txt.style.font = font;
    txt.style.fontSize = "1rem";
    txt.style.height = 'auto';
    txt.style.width = 'auto';
    txt.style.position = 'absolute';
    txt.style.whiteSpace = 'no-wrap';
    txt.innerHTML = 'aaaaaaaaaa';
    console.log(txt)
    const w = txt.clientWidth/txt.innerHTML.length;
    this.outputDiv.removeChild(txt);
    return w;
  }

  addEventListeners() {
    this.input.addEventListener("input", (e) => {
      this.output.textContent = this.input.value;
      this.updateSelection();
    })
    this.input.addEventListener("keydown", (e) => {
      if(e.keyCode == 13) {// enter
        this.oncommand(this.input.value);
        this.input.value = "";
        this.output.innerHTML = "";
        this.updateSelection();
        e.preventDefault();
      }
    }, true)
    this.input.addEventListener("keyup", ()=>{this.updateSelection()})

    this.input.addEventListener("mousedown", () => {this.mouseDown = true;})
    this.input.addEventListener("mouseup", () => {
      this.mouseDown = false;
      
      this.caret.style.visibility = this.input.readOnly ? "hidden" : "visible";
      this.updateSelection();
    })

    this.input.addEventListener("mousemove", () => {
      if(this.mouseDown) {
        this.caret.style.visibility = "hidden";
      }
    })

    this.input.addEventListener("focus", () => {
      this.caret.style.visibility = this.input.readOnly ? "hidden" : "visible";
    })
    
    this.input.addEventListener("blur", () => {
      this.caret.style.visibility = "hidden";
    })
  }

  updateSelection () {
    if(!this.initialized) return;
    const start = this.input.selectionStart;
    const end = this.input.selectionEnd;
    const maxChars = Math.floor(this.output.clientWidth / this.charW);
    if(end-start <= 1) {
      this.caret.style.left = `${(start%maxChars)*this.charW}px`;
      this.caret.style.top = `${Math.floor(start/maxChars)}em`;
    } else {
      this.caret.style.visibility = "hidden";
    }
  }

  // TODO: optimise
  /* optimisations:
    - clone element instead of creating scratch
    - dont push immediately to dom tree
  */
  addLine(content="", className="out", color="transparent") {
    if(!this.initialized) return; // maybe add undisplayable messages to a queue of sorts
    const line = document.createElement("section");
    line.className = className;
    line.style.backgroundColor = color;
    const timestamp = document.createElement("h2");
    const now = new Date();
    timestamp.innerText = formatTimestamp(now);
    timestamp.title = now.toTimeString();
    const body = document.createElement("p");
    console.log(content);
    body.innerText = content;
  
    line.appendChild(timestamp);
    line.appendChild(body);
    this.log.appendChild(line);
    
    this.log.scrollBy(0,10000);
  }
}