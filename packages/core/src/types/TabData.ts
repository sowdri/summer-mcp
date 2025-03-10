/**
 * Tab data types for the MCP system
 */

import { ConsoleLogEntry, NetworkRequest } from "./BrowserMessage";

// Alias types for backward compatibility
export type ConsoleLog = ConsoleLogEntry;

// Tab-specific browser data
export interface TabData {
  consoleLogs: ConsoleLog[]; // All console logs including errors and warnings
  networkRequests: NetworkRequest[];
  lastUpdated: number;
} 