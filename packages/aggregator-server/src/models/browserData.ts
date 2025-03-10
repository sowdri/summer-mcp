/**
 * Browser data model
 */
import {
  BrowserData,
  BrowserDataConfig,
  BrowserDataProvider,
  ConsoleLog,
  TabData
} from "../types/index.js";
import { BrowserTab, NetworkRequest } from "@summer-mcp/core";

// Configuration constants
export const BROWSER_DATA_CONFIG: BrowserDataConfig = {
  MAX_CONSOLE_LOGS: 1000, // All console logs including errors and warnings
  MAX_NETWORK_REQUESTS: 1000
};

// Create an empty tab data structure
function createEmptyTabData(): TabData {
  return {
    consoleLogs: [], // All console logs including errors and warnings
    networkRequests: [],
    lastUpdated: Date.now()
  };
}

// In-memory browser data
export const browserData: BrowserData = {
  tabs: {},
};

/**
 * In-memory implementation of the BrowserDataProvider interface
 */
export class InMemoryBrowserDataProvider implements BrowserDataProvider {
  private config: BrowserDataConfig;
  private data: BrowserData;

  constructor(
    data: BrowserData = browserData,
    config: BrowserDataConfig = BROWSER_DATA_CONFIG
  ) {
    this.data = data;
    this.config = config;
  }

  // Core operations
  getTabData(tabId: string): TabData | null {
    return this.data.tabs[tabId] || null;
  }

  createTabData(tabId: string): TabData {
    const newTabData = createEmptyTabData();
    this.data.tabs[tabId] = newTabData;
    return newTabData;
  }

  deleteTabData(tabId: string): boolean {
    if (this.data.tabs[tabId]) {
      delete this.data.tabs[tabId];
      return true;
    }
    return false;
  }

  // Ensure tab data exists
  private ensureTabData(tabId: string): TabData {
    if (!this.data.tabs[tabId]) {
      return this.createTabData(tabId);
    }
    return this.data.tabs[tabId];
  }

  // Log operations
  addConsoleLog(tabId: string, log: ConsoleLog): void {
    const tabData = this.ensureTabData(tabId);

    // Add timestamp if not present
    if (!log.timestamp) {
      log.timestamp = Date.now();
    }

    // Add to the beginning for newest first
    tabData.consoleLogs.unshift(log);

    // Limit the number of entries
    if (tabData.consoleLogs.length > this.config.MAX_CONSOLE_LOGS) {
      tabData.consoleLogs = tabData.consoleLogs.slice(
        0,
        this.config.MAX_CONSOLE_LOGS
      );
    }

    tabData.lastUpdated = Date.now();
  }

  addNetworkRequest(tabId: string, request: NetworkRequest): void {
    const tabData = this.ensureTabData(tabId);
    
    // Add the request to the beginning of the array (newest first)
    tabData.networkRequests.unshift(request);
    
    // Trim the array if it exceeds the maximum number of entries
    if (tabData.networkRequests.length > this.config.MAX_NETWORK_REQUESTS) {
      tabData.networkRequests.length = this.config.MAX_NETWORK_REQUESTS;
    }
    
    tabData.lastUpdated = Date.now();
  }

  // Tab operations
  // updateActiveTab method removed as activeTab doesn't belong in TabData

  // Utility operations
  clearTabLogs(tabId: string): void {
    // Get tab data
    const tabData = this.getTabData(tabId);

    // If tab data exists, clear all logs
    if (tabData) {
      tabData.consoleLogs = [];
      tabData.networkRequests = [];
      tabData.lastUpdated = Date.now();
    }
  }

  clearAllLogs(): void {
    // Clear all tab data
    for (const tabId in this.data.tabs) {
      this.clearTabLogs(tabId);
    }
  }

  // Configuration
  getMaxEntries(): number {
    return Math.max(
      this.config.MAX_CONSOLE_LOGS,
      this.config.MAX_NETWORK_REQUESTS
    );
  }

  setMaxEntries(count: number): void {
    this.config.MAX_CONSOLE_LOGS = count;
    this.config.MAX_NETWORK_REQUESTS = count;
  }
}

// Create and export the default provider instance
export const browserDataProvider = new InMemoryBrowserDataProvider();

// Legacy API compatibility functions
// These are kept for backward compatibility but delegate to the provider

/**
 * Clear all logs and data
 */
export function clearAllLogs(): void {
  browserDataProvider.clearAllLogs();
}

/**
 * Add console log
 * @param tabId The ID of the tab that generated the log
 * @param log The console log entry
 */
export function addConsoleLog(tabId: string, log: any): void {
  browserDataProvider.addConsoleLog(tabId, log);
}

/**
 * Add network request
 */
export function addNetworkRequest(request: any): void {
  // Use a default tab ID for legacy calls
  const defaultTabId = "default";

  browserDataProvider.addNetworkRequest(defaultTabId, request);
}

/**
 * Add network error
 */
export function addNetworkError(request: any): void {
  // Use a default tab ID for legacy calls
  const defaultTabId = "default";
  
  // Mark as error
  request.isError = true;
  
  browserDataProvider.addNetworkRequest(defaultTabId, request);
}

/**
 * Wrapper function for updating active tab information
 * Note: This no longer updates TabData directly as activeTab has been removed from TabData
 */
export function updateActiveTab(data: any): void {
  if (!data || !data.id) {
    console.error("Invalid tab data:", data);
    return;
  }

  // Instead of updating TabData, we now just handle the active tab data separately
  // Any code that needs the active tab data should use a different mechanism
  // This function is kept as a placeholder to avoid breaking existing code
  console.log("Active tab updated:", data.id);
}
