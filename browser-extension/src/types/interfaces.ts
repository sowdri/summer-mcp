// Debugger connection state
export interface DebuggerConnection {
  tabId: number;
  attached: boolean;
}

// Server command message
export interface ServerCommand {
  command: string;
  [key: string]: any;
}

// Message types for WebSocket communication
export type MessageType =
  | "screenshot"
  | "console-logs"
  | "network-requests"
  | "dom-snapshot"
  | "browser-tabs";

// Message structure for sending data to the server
export interface WebSocketMessage {
  type: MessageType;
  data: any;
}
