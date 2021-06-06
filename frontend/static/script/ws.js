class Connection {
    constructor() {
        this.onopen = () => {};
        this.onclose = () => {};
        this.onerror = () => {};
        this.ontext = () => {};
        this.oncmd = () => {};
    }

    init() {
        this.socket = new WebSocket(`ws://${window.location.hostname}:18249`);
        this.socket.addEventListener('open', this.onopen);
        this.socket.addEventListener('close', this.onclose);
        this.socket.addEventListener('error', this.onerror);
        this.socket.addEventListener('message', function (event) {
            if(typeof event.data == "string") { // plaintext resp, must be from rcon
                this.ontext(event.data);
            } else { // binary response, must be from communicator itself
                event.data.arrayBuffer().then((buf) => {
                    const view = new Uint8Array(buf);
                    // TODO: this can definitely be optimised
                    let str = "";
                    for(let i = 0; i < view.length; i++) {
                        str += String.fromCharCode(view[i]);
                    }
                    return atob(str);
                }).then(JSON.parse).catch((e) => {
                    console.error("failed to parse command JSON");
                    console.error(e);
                }).then(this.oncmd);
            }
        }.bind(this));
        fetch(`http://${window.location.hostname}:${window.location.port}/token`).then(res => res.text()).then( token => {
            this.send(token);
        });
    
    }

    sendCmd(cmd) {
        console.log('sending cmd: ', cmd)
        this.socket.send(Uint8Array.from(btoa(JSON.stringify(cmd)), c=>c.charCodeAt(0)).buffer);
    }

    send(data) {
        this.socket.send(data);
    }
}