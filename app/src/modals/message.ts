export enum MessageType {
  IN,
  OUT
}

export interface Message {
  timestamp: number,
  body: string,
  msg_type: MessageType,
}