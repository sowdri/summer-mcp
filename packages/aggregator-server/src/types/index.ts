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
  ConnectionStatusCommand,
  BrowserTab
} from "@summer-mcp/core";

// Re-export types from core package
export {
  BrowserMessageType,
  BrowserMessage,
  ServerCommandType,
  ServerCommand,
  ServerMessage,
  ConnectionStatusCommand,
  BrowserTab
};

// Re-export types from local files
export * from "./browser-data.js";
export * from "./tab-data.js";
