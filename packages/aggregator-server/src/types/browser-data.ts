/**
 * Browser data types for the aggregator server
 */

import { BrowserTab, NetworkRequest } from "@summer-mcp/core";
import { 
  TabData, 
  ConsoleLog, 
  TabEvent, 
  DebuggerEvent, 
  MonitorStatus, 
  MonitorError, 
  ExtensionEvent 
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
  addNetworkSuccess(tabId: string, request: NetworkRequest): void;
  addNetworkError(tabId: string, request: NetworkRequest): void;

  // Tab operations
  updateActiveTab(tabId: string, data: BrowserTab): void;
  addTabEvent(tabId: string, event: TabEvent): void;
  addDebuggerEvent(tabId: string, event: DebuggerEvent): void;

  // Monitor operations
  addMonitorStatus(tabId: string, type: string, status: MonitorStatus): void;
  addMonitorError(tabId: string, type: string, error: MonitorError): void;

  // Extension operations
  addExtensionEvent(event: ExtensionEvent): void;

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
  MAX_NETWORK_SUCCESS: number;
  MAX_NETWORK_ERRORS: number;
  MAX_TAB_EVENTS: number;
  MAX_DEBUGGER_EVENTS: number;
  MAX_MONITOR_STATUS: number;
  MAX_MONITOR_ERRORS: number;
  MAX_EXTENSION_EVENTS: number;
}

// Browser tabs response
export interface BrowserTabsResponse {
  tabs: BrowserTab[];
  timestamp: number;
} 