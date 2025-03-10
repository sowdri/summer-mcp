/**
 * Type definitions for the aggregator server
 */

// Import types from core package
import {
  BrowserMessageType,
  BrowserMessage,
  ServerCommandType,
  ServerCommand,
  ServerMessage,
  BrowserTab
} from "@summer-mcp/core";

// Re-export types from core package
export {
  BrowserMessageType,
  BrowserMessage,
  ServerCommandType,
  ServerCommand,
  ServerMessage,
  BrowserTab
};

// Re-export types from local files
export * from "./browser-data.js";
export * from "./tab-data.js";

/**
 * Message types sent from aggregator server to browser extension
 */
export enum AggregatorWebSocketSendMessageType {
  CONNECTION = "connection",
  COMMAND = "command"
}

/**
 * Message types received by aggregator server from browser extension
 */
export type AggregatorWebSocketReceiveMessageType = BrowserMessageType;
