// Debugger connection state
export interface DebuggerConnection {
  tabId: number;
  attached: boolean;
}

// Export types from core package
export {
  // Server command types
  ServerCommandType,
  ServerCommand,
  ServerMessage,
  
  // Browser message types
  BrowserMessageType,
  BrowserMessage
} from "@summer-mcp/core";

// For backward compatibility with existing code
export type MessageType = string;
export interface WebSocketMessage {
  type: string;
  data: any;
}

// Enum for message types received by browser extension from aggregator server
export enum BrowserWebSocketReceiveMessageType {
  CONNECTION = "connection",
  COMMAND = "command"
}
