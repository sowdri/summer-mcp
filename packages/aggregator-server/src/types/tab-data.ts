/**
 * Tab data types for the aggregator server
 */

import { ConsoleLogEntry, NetworkRequest, BrowserTab } from "@summer-mcp/core";

// Alias types from core for backward compatibility
export type ConsoleLog = ConsoleLogEntry;

// Tab-specific browser data
export interface TabData {
  consoleLogs: ConsoleLog[]; // All console logs including errors and warnings
  networkRequests: NetworkRequest[];
  selectedElement: any | null;
  activeTab?: BrowserTab; // Using BrowserTab directly from core
  lastUpdated: number;
} 