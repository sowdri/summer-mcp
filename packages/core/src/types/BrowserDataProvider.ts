/**
 * Browser data provider interface for the MCP system
 */

import { BrowserTab, NetworkRequest } from "./messages";
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