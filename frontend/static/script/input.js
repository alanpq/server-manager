const input = document.querySelector("textarea.console");

const log = document.querySelector(".output");

const outputDiv = document.querySelector("div.console");
const caret = document.querySelector("div.console .caret");
const selection = document.querySelector("div.console .selection");
const output = document.querySelector("div.console .content");
const dropdown = document.querySelector("div.console .dropdown");

const formatTimestamp = (timestamp) => {
  return `${("0"+timestamp.getHours()).slice(-2)}:${("0"+timestamp.getMinutes()).slice(-2)}:${("0"+timestamp.getSeconds()).slice(-2)}`
}

const getCharWidth = () => {
  const txt = document.createElement("span");
  outputDiv.appendChild(txt);
  txt.id = "bruh";
  txt.style.font = output.style.font;
  txt.style.fontSize = "1em";
  txt.style.height = 'auto';
  txt.style.width = 'auto';
  txt.style.position = 'absolute';
  txt.style.whiteSpace = 'no-wrap';
  txt.innerHTML = 'aaaaaaaaaa';
  console.log(txt)
  const w = txt.clientWidth/txt.innerHTML.length;
  outputDiv.removeChild(txt);
  console.log(w);
  return w;
}
// TODO: optimise
/*
optimisations:
  - clone element instead of creating scratch
  - dont push immediately to dom tree
*/
const addLine = (content="", className="out") => {
  const line = document.createElement("section");
  line.className = className;
  const timestamp = document.createElement("h2");
  timestamp.innerText = formatTimestamp(new Date());
  const body = document.createElement("p");
  body.innerText = content;

  line.appendChild(timestamp);
  line.appendChild(body);
  log.appendChild(line);
}

const renderOutput = () => {

}

let charW = 9;

window.onload = () => {
  charW = getCharWidth();
}

const updateSelection = (s, e) => {
  const start = s || input.selectionStart;
  const end = e || input.selectionEnd;
  const maxChars = Math.floor(output.clientWidth / charW);
  console.log(start, end);
  if(end-start <= 1) {
    caret.style.left = `${(start%maxChars)*charW}px`;
    caret.style.top = `${Math.floor(start/maxChars)}em`;
  } else {

  }
}

input.addEventListener("input", (e) => {
  output.textContent = input.value;
  updateSelection();
})
input.addEventListener("keydown", (e) => {
  if(e.keyCode == 13) {// enter
    addLine(input.value, "in");
    input.value = "";
    output.innerHTML = "";
    updateSelection();
    e.preventDefault();
  }
}, true)
input.addEventListener("keyup", () => {updateSelection()})

input.addEventListener("focus", () => {
  caret.style.visibility = "visible";
})

input.addEventListener("blur", () => {
  caret.style.visibility = "hidden";
})