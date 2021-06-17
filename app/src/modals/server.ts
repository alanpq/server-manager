export type CommunicatorStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "MISSING";

export interface ServerSettings {
  type: string,
  name: string,
  value: string,
}

export interface Server {
  id: string,
  name: string,
  communicator: CommunicatorStatus,
  settings: ServerSettings[],
  clients: any,
}