/**
 * Browser data model
 */
import {
  BrowserData,
  BrowserDataConfig,
  BrowserDataProvider,
  ConsoleLog,
  NetworkRequest,
  TabData,
} from "../types/index.js";

// Configuration constants
export const BROWSER_DATA_CONFIG: BrowserDataConfig = {
  MAX_CONSOLE_LOGS: 1000,
  MAX_CONSOLE_ERRORS: 1000,
  MAX_NETWORK_SUCCESS: 1000,
  MAX_NETWORK_ERRORS: 1000,
};

// Create an empty tab data structure
function createEmptyTabData(): TabData {
  return {
    consoleLogs: [],
    consoleErrors: [],
    networkRequests: {
      success: [],
      errors: [],
    },
    selectedElement: null,
    lastUpdated: Date.now(),
  };
}

// Store data from browser extension
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

  addConsoleError(tabId: string, error: ConsoleLog): void {
    const tabData = this.ensureTabData(tabId);

    // Add timestamp if not present
    if (!error.timestamp) {
      error.timestamp = Date.now();
    }

    // Add to the beginning for newest first
    tabData.consoleErrors.unshift(error);

    // Limit the number of entries
    if (tabData.consoleErrors.length > this.config.MAX_CONSOLE_ERRORS) {
      tabData.consoleErrors = tabData.consoleErrors.slice(
        0,
        this.config.MAX_CONSOLE_ERRORS
      );
    }

    tabData.lastUpdated = Date.now();
  }

  addNetworkSuccess(tabId: string, request: NetworkRequest): void {
    const tabData = this.ensureTabData(tabId);

    // Add timestamp if not present
    if (!request.timestamp) {
      request.timestamp = Date.now();
    }

    // Add to the beginning for newest first
    tabData.networkRequests.success.unshift(request);

    // Limit the number of entries
    if (
      tabData.networkRequests.success.length > this.config.MAX_NETWORK_SUCCESS
    ) {
      tabData.networkRequests.success = tabData.networkRequests.success.slice(
        0,
        this.config.MAX_NETWORK_SUCCESS
      );
    }

    tabData.lastUpdated = Date.now();
  }

  addNetworkError(tabId: string, request: NetworkRequest): void {
    const tabData = this.ensureTabData(tabId);

    // Add timestamp if not present
    if (!request.timestamp) {
      request.timestamp = Date.now();
    }

    // Add to the beginning for newest first
    tabData.networkRequests.errors.unshift(request);

    // Limit the number of entries
    if (
      tabData.networkRequests.errors.length > this.config.MAX_NETWORK_ERRORS
    ) {
      tabData.networkRequests.errors = tabData.networkRequests.errors.slice(
        0,
        this.config.MAX_NETWORK_ERRORS
      );
    }

    tabData.lastUpdated = Date.now();
  }

  // Asset operations
  setSelectedElement(tabId: string, data: any): void {
    const tabData = this.ensureTabData(tabId);
    tabData.selectedElement = data;
    tabData.lastUpdated = Date.now();
  }

  // Utility operations
  clearTabLogs(tabId: string): void {
    const tabData = this.getTabData(tabId);
    if (tabData) {
      tabData.consoleLogs = [];
      tabData.consoleErrors = [];
      tabData.networkRequests.success = [];
      tabData.networkRequests.errors = [];
      tabData.lastUpdated = Date.now();
    }
  }

  clearAllLogs(): void {
    // Clear logs for all tabs
    Object.keys(this.data.tabs).forEach((tabId) => {
      this.clearTabLogs(tabId);
    });
  }

  // Configuration
  getMaxEntries(): number {
    return Math.max(
      this.config.MAX_CONSOLE_LOGS,
      this.config.MAX_CONSOLE_ERRORS,
      this.config.MAX_NETWORK_SUCCESS,
      this.config.MAX_NETWORK_ERRORS
    );
  }

  setMaxEntries(count: number): void {
    this.config.MAX_CONSOLE_LOGS = count;
    this.config.MAX_CONSOLE_ERRORS = count;
    this.config.MAX_NETWORK_SUCCESS = count;
    this.config.MAX_NETWORK_ERRORS = count;
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
 */
export function addConsoleLog(log: any): void {
  // Use a default tab ID for legacy calls
  const defaultTabId = "default";
  browserDataProvider.addConsoleLog(defaultTabId, log);
}

/**
 * Add network request
 */
export function addNetworkRequest(request: any): void {
  // Use a default tab ID for legacy calls
  const defaultTabId = "default";

  if (request.method === "Network.loadingFailed") {
    browserDataProvider.addNetworkError(defaultTabId, request);
  } else {
    browserDataProvider.addNetworkSuccess(defaultTabId, request);
  }
}

/**
 * Set selected element data
 */
export function setSelectedElement(data: any): void {
  // Use a default tab ID for legacy calls
  const defaultTabId = "default";
  browserDataProvider.setSelectedElement(defaultTabId, data);
}
