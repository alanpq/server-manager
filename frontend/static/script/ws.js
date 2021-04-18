// Create WebSocket connection.
const socket = new WebSocket(`ws://${window.location.hostname}:8080/asd`);

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    addLine('Message from server ', event.data);
});