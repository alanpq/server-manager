export type CommunicatorStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "MISSING";

export interface Server {
  id: string,
  name: string,
  communicator: CommunicatorStatus,
  settings: any,
  clients: any,
}