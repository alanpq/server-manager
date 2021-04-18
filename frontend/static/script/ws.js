// Create WebSocket connection.
const socket = new WebSocket(`ws://${window.location.hostname}:8080`);

// Connection opened
socket.addEventListener('open', function (event) {
    serverConsole.addLine("Connected to Websocket.", "meta")
    serverConsole.oncommand = (msg) => {socket.send(msg)};
});

// Listen for messages
socket.addEventListener('message', function (event) {
    serverConsole.addLine(event.data);
});