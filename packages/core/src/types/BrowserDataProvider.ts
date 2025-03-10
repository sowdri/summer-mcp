/**
 * Browser data provider interface for the MCP system
 */

import { NetworkRequest } from "./BrowserMessage";
import { TabData, ConsoleLog } from "./TabData";

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
  // updateActiveTab method removed as activeTab doesn't belong in TabData

  // Utility operations
  clearTabLogs(tabId: string): void;
  clearAllLogs(): void;

  // Configuration
  getMaxEntries(): number;
  setMaxEntries(count: number): void;
} 