/**
 * Browser data types for the aggregator server
 */

import { BrowserTab, NetworkRequest } from "@summer-mcp/core";
import { 
  TabData, 
  ConsoleLog
} from "./tab-data.js";

// Browser data interface
export interface BrowserData {
  tabs: Record<string, TabData>;
}

// Browser data storage provider interface
export interface BrowserDataProvider {
  // Core operations
  getTabData(tabId: string): TabData | null;
  createTabData(tabId: string): TabData;
  deleteTabData(tabId: string): boolean;

  // Log operations
  addConsoleLog(tabId: string, log: ConsoleLog): void;
  addNetworkRequest(tabId: string, request: NetworkRequest): void;

  // Tab operations
  updateActiveTab(tabId: string, data: BrowserTab): void;

  // Asset operations
  setSelectedElement(tabId: string, data: any): void;

  // Utility operations
  clearTabLogs(tabId: string): void;
  clearAllLogs(): void;

  // Configuration
  getMaxEntries(): number;
  setMaxEntries(count: number): void;
}

// Configuration constants
export interface BrowserDataConfig {
  MAX_CONSOLE_LOGS: number; // All console logs including errors and warnings
  MAX_NETWORK_REQUESTS: number;
}

// Browser tabs response
export interface BrowserTabsResponse {
  tabs: BrowserTab[];
  timestamp: number;
} 