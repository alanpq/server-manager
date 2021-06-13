export enum MessageType {
  IN,
  OUT
}

export interface Message {
  timestamp: number,
  user: string, // TODO: ensure this user id is consistent between sessions
  body: string,
  msg_type: MessageType,
}