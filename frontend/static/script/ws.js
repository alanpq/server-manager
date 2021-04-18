// Create WebSocket connection.
const socket = new WebSocket(`ws://${window.location.hostname}:8080`);

// Connection opened
socket.addEventListener('open', function (event) {
    serverConsole.addLine("Connected to Websocket.", "meta")
    serverConsole.oncommand = (msg) => {socket.send(msg)};
});

// Listen for messages
socket.addEventListener('message', function (event) {
    if(typeof event.data == "string") { // plaintext resp, must be from rcon
        serverConsole.addLine(event.data);
    } else { // binary response, must be from communicator itself
        event.data.arrayBuffer().then((buf) => {
            const view = new Uint8Array(buf);
            // TODO: this can definitely be optimised
            let str = "";
            for(let i = 0; i < view.length; i++) {
                str += String.fromCharCode(view[i]);
            }
            console.log(view);
            console.log(atob(str));
        });
    }
});