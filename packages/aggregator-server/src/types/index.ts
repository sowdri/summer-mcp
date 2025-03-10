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
  BrowserTab,
  // Import the moved types from core
  BrowserData,
  BrowserDataProvider,
  BrowserDataConfig,
  BrowserTabsResponse,
  TabData,
  ConsoleLog
} from "@summer-mcp/core";

// Re-export types from core package
export {
  BrowserMessageType,
  BrowserMessage,
  ServerCommandType,
  ServerCommand,
  ServerMessage,
  ConnectionStatusCommand,
  BrowserTab,
  // Re-export the moved types
  BrowserData,
  BrowserDataProvider,
  BrowserDataConfig,
  BrowserTabsResponse,
  TabData,
  ConsoleLog
};

// No need to re-export from local files anymore as they've been moved to core
// export * from "./browser-data.js";
// export * from "./tab-data.js";
