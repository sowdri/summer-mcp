/**
 * Browser data model
 */
import {
  ActiveTab,
  BrowserData,
  BrowserDataConfig,
  BrowserDataProvider,
  ConsoleLog,
  DebuggerEvent,
  ExtensionEvent,
  MonitorError,
  MonitorStatus,
  NetworkRequest,
  TabData,
  TabEvent,
} from "../types/index.js";

// Configuration constants
export const BROWSER_DATA_CONFIG: BrowserDataConfig = {
  MAX_CONSOLE_LOGS: 1000, // All console logs including errors and warnings
  MAX_NETWORK_SUCCESS: 1000,
  MAX_NETWORK_ERRORS: 1000,
  MAX_TAB_EVENTS: 100,
  MAX_DEBUGGER_EVENTS: 100,
  MAX_MONITOR_STATUS: 100,
  MAX_MONITOR_ERRORS: 100,
  MAX_EXTENSION_EVENTS: 100,
};

// Create an empty tab data structure
function createEmptyTabData(): TabData {
  return {
    consoleLogs: [], // All console logs including errors and warnings
    networkRequests: {
      success: [],
      errors: [],
    },
    selectedElement: null,
    activeTab: undefined,
    tabEvents: [],
    debuggerEvents: [],
    monitorStatus: {
      console: [],
      network: [],
    },
    monitorErrors: {
      console: [],
      network: [],
    },
    extensionEvents: [],
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

  // Tab operations
  updateActiveTab(tabId: string, data: ActiveTab): void {
    const tabData = this.ensureTabData(tabId);

    // Add timestamp if not present
    if (!data.timestamp) {
      data.timestamp = Date.now();
    }

    tabData.activeTab = data;
    tabData.lastUpdated = Date.now();

    console.log(`Active tab updated for tab ${tabId}: ${data.url}`);
  }

  addTabEvent(tabId: string, event: TabEvent): void {
    const tabData = this.ensureTabData(tabId);

    // Add timestamp if not present
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }

    // Add to the beginning for newest first
    tabData.tabEvents.unshift(event);

    // Limit the number of entries
    if (tabData.tabEvents.length > this.config.MAX_TAB_EVENTS) {
      tabData.tabEvents = tabData.tabEvents.slice(
        0,
        this.config.MAX_TAB_EVENTS
      );
    }

    tabData.lastUpdated = Date.now();

    console.log(`Tab event added for tab ${tabId}: ${event.event}`);
  }

  addDebuggerEvent(tabId: string, event: DebuggerEvent): void {
    const tabData = this.ensureTabData(tabId);

    // Add timestamp if not present
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }

    // Add to the beginning for newest first
    tabData.debuggerEvents.unshift(event);

    // Limit the number of entries
    if (tabData.debuggerEvents.length > this.config.MAX_DEBUGGER_EVENTS) {
      tabData.debuggerEvents = tabData.debuggerEvents.slice(
        0,
        this.config.MAX_DEBUGGER_EVENTS
      );
    }

    tabData.lastUpdated = Date.now();

    console.log(`Debugger event added for tab ${tabId}: ${event.event}`);
  }

  // Monitor operations
  addMonitorStatus(tabId: string, type: string, status: MonitorStatus): void {
    const tabData = this.ensureTabData(tabId);

    // Add timestamp if not present
    if (!status.timestamp) {
      status.timestamp = Date.now();
    }

    // Determine which array to add to
    const statusArray = type.includes("console")
      ? tabData.monitorStatus.console
      : tabData.monitorStatus.network;

    // Add to the beginning for newest first
    statusArray.unshift(status);

    // Limit the number of entries
    if (statusArray.length > this.config.MAX_MONITOR_STATUS) {
      const newLength = Math.min(
        statusArray.length,
        this.config.MAX_MONITOR_STATUS
      );
      statusArray.length = newLength;
    }

    tabData.lastUpdated = Date.now();

    console.log(
      `Monitor status added for tab ${tabId}: ${type} - ${status.status}`
    );
  }

  addMonitorError(tabId: string, type: string, error: MonitorError): void {
    const tabData = this.ensureTabData(tabId);

    // Add timestamp if not present
    if (!error.timestamp) {
      error.timestamp = Date.now();
    }

    // Determine which array to add to
    const errorArray = type.includes("console")
      ? tabData.monitorErrors.console
      : tabData.monitorErrors.network;

    // Add to the beginning for newest first
    errorArray.unshift(error);

    // Limit the number of entries
    if (errorArray.length > this.config.MAX_MONITOR_ERRORS) {
      const newLength = Math.min(
        errorArray.length,
        this.config.MAX_MONITOR_ERRORS
      );
      errorArray.length = newLength;
    }

    tabData.lastUpdated = Date.now();

    console.log(
      `Monitor error added for tab ${tabId}: ${type} - ${error.error}`
    );
  }

  // Extension operations
  addExtensionEvent(event: ExtensionEvent): void {
    // Use a special tab ID for extension-wide events
    const tabId = "extension";
    const tabData = this.ensureTabData(tabId);

    // Add timestamp if not present
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }

    // Add to the beginning for newest first
    tabData.extensionEvents.unshift(event);

    // Limit the number of entries
    if (tabData.extensionEvents.length > this.config.MAX_EXTENSION_EVENTS) {
      tabData.extensionEvents = tabData.extensionEvents.slice(
        0,
        this.config.MAX_EXTENSION_EVENTS
      );
    }

    tabData.lastUpdated = Date.now();

    console.log(`Extension event added: ${event.event}`);
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
      tabData.networkRequests.success = [];
      tabData.networkRequests.errors = [];
      tabData.tabEvents = [];
      tabData.debuggerEvents = [];
      tabData.monitorStatus.console = [];
      tabData.monitorStatus.network = [];
      tabData.monitorErrors.console = [];
      tabData.monitorErrors.network = [];
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
      this.config.MAX_NETWORK_SUCCESS,
      this.config.MAX_NETWORK_ERRORS,
      this.config.MAX_TAB_EVENTS,
      this.config.MAX_DEBUGGER_EVENTS,
      this.config.MAX_MONITOR_STATUS,
      this.config.MAX_MONITOR_ERRORS,
      this.config.MAX_EXTENSION_EVENTS
    );
  }

  setMaxEntries(count: number): void {
    this.config.MAX_CONSOLE_LOGS = count;
    this.config.MAX_NETWORK_SUCCESS = count;
    this.config.MAX_NETWORK_ERRORS = count;
    this.config.MAX_TAB_EVENTS = count;
    this.config.MAX_DEBUGGER_EVENTS = count;
    this.config.MAX_MONITOR_STATUS = count;
    this.config.MAX_MONITOR_ERRORS = count;
    this.config.MAX_EXTENSION_EVENTS = count;
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

  if (request.method === "Network.loadingFailed") {
    browserDataProvider.addNetworkError(defaultTabId, request);
  } else {
    browserDataProvider.addNetworkSuccess(defaultTabId, request);
  }
}

/**
 * Add network error
 */
export function addNetworkError(request: any): void {
  // Use a default tab ID for legacy calls
  const defaultTabId = "default";
  browserDataProvider.addNetworkError(defaultTabId, request);
}

/**
 * Set selected element
 */
export function setSelectedElement(data: any): void {
  // Use a default tab ID for legacy calls
  const defaultTabId = "default";
  browserDataProvider.setSelectedElement(defaultTabId, data);
}

/**
 * Update active tab
 */
export function updateActiveTab(data: ActiveTab): void {
  // Extract tabId from the data or use default
  const tabId = data.tabId?.toString() || "default";
  browserDataProvider.updateActiveTab(tabId, data);
}

/**
 * Add tab event
 */
export function addTabEvent(event: TabEvent): void {
  // Extract tabId from the event or use default
  const tabId = event.tabId?.toString() || "default";
  browserDataProvider.addTabEvent(tabId, event);
}

/**
 * Add debugger event
 */
export function addDebuggerEvent(event: DebuggerEvent): void {
  // Extract tabId from the event or use default
  const tabId = event.tabId?.toString() || "default";
  browserDataProvider.addDebuggerEvent(tabId, event);
}

/**
 * Add monitor status
 */
export function addMonitorStatus(type: string, status: MonitorStatus): void {
  // Extract tabId from the status or use default
  const tabId = status.tabId?.toString() || "default";
  browserDataProvider.addMonitorStatus(tabId, type, status);
}

/**
 * Add monitor error
 */
export function addMonitorError(type: string, error: MonitorError): void {
  // Extract tabId from the error or use default
  const tabId = error.tabId?.toString() || "default";
  browserDataProvider.addMonitorError(tabId, type, error);
}

/**
 * Add extension event
 */
export function addExtensionEvent(event: ExtensionEvent): void {
  browserDataProvider.addExtensionEvent(event);
}
