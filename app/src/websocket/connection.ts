/**
 * Converts binary message -> base64 -> string
 * @param buffer Binary message buffer
 */
const process_binary = (buffer: ArrayBuffer) => {
  const view = new Uint8Array(buffer);
  // TODO: this can definitely be optimised
  let str = "";
  for(let i = 0; i < view.length; i++) {
    str += String.fromCharCode(view[i]); // surely like some string builder js alternative
  }
  return atob(str);
}

export default class Connection {
  public on_open: () => void;
  public on_close: () => void;
  public on_error: (error: any) => void;
  public on_text: (message: string) => void;
  public on_cmd: (command: any) => void;
  private socket: WebSocket;

  constructor() {
    this.on_open = () => {};
    this.on_close = () => {};
    this.on_error = () => {};
    this.on_text = () => {};
    this.on_cmd = () => {};

    this.socket = new WebSocket(`wss://${window.location.hostname}:18249`);
    this.socket.addEventListener('open', () => {
      // TODO: this should be able to retry
      // TODO: implement auth again :)
      // fetch(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/token`)
      //   .then(res => res.text()).then(data => this.send.call(this, data));
      this.on_open();
    });
    this.socket.addEventListener('close', this.on_close);
    this.socket.addEventListener('error', this.on_error);
    this.socket.addEventListener('message', (e) => {
      if (typeof e.data === "string") {
        this.on_text(e.data);
      } else {
        e.data.arrayBuffer().then(process_binary).then(JSON.parse).catch((e: any) => {
          console.error("failed to parse command JSON");
          console.error(e);
        }).then(this.on_cmd);
      }
    });
  }

  send_cmd(cmd: any) {
    if(this.socket.readyState !== 1) {
      // FIXME: queue these commands
      console.warn("socket not ready to send messages.");
      return;
    }
    console.log('sending cmd: ', cmd);
    this.socket.send(Uint8Array.from(btoa(JSON.stringify(cmd)), c=>c.charCodeAt(0)).buffer);
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if(this.socket.readyState !== 1) {
      console.warn("socket not ready to send messages.");
      return;
    }
    this.socket.send(data);
  }
}