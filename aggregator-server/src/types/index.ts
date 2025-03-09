/**
 * Type definitions for the aggregator server
 */

// Console log interface
export interface ConsoleLog {
  level?: string;
  type?: string;
  message?: string;
  timestamp?: number;
  [key: string]: any;
}

// Network request interface
export interface NetworkRequest {
  method: string;
  timestamp?: number;
  [key: string]: any;
}

// Active tab information
export interface ActiveTab {
  tabId: number | string;
  url?: string;
  title?: string;
  favIconUrl?: string;
  timestamp?: number | string;
  [key: string]: any;
}

// Tab event information
export interface TabEvent {
  event: string; // 'removed', 'updated', etc.
  tabId: number | string;
  timestamp?: number | string;
  [key: string]: any;
}

// Debugger event information
export interface DebuggerEvent {
  event: string; // 'attached', 'detached', etc.
  tabId: number | string;
  reason?: string;
  timestamp?: number | string;
  [key: string]: any;
}

// Monitor status information
export interface MonitorStatus {
  tabId: number | string;
  status: string; // 'started', 'stopped', etc.
  timestamp?: number | string;
  [key: string]: any;
}

// Monitor error information
export interface MonitorError {
  tabId: number | string;
  error: string;
  timestamp?: number | string;
  [key: string]: any;
}

// Extension event information
export interface ExtensionEvent {
  event: string; // 'startup', 'reconnect', 'suspend', etc.
  version?: string;
  timestamp?: number | string;
  [key: string]: any;
}

// Tab-specific browser data
export interface TabData {
  consoleLogs: ConsoleLog[];
  consoleErrors: ConsoleLog[];
  networkRequests: {
    success: NetworkRequest[];
    errors: NetworkRequest[];
  };
  selectedElement: any | null;
  activeTab?: ActiveTab;
  tabEvents: TabEvent[];
  debuggerEvents: DebuggerEvent[];
  monitorStatus: {
    console: MonitorStatus[];
    network: MonitorStatus[];
  };
  monitorErrors: {
    console: MonitorError[];
    network: MonitorError[];
  };
  extensionEvents: ExtensionEvent[];
  lastUpdated: number;
}

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
  addConsoleError(tabId: string, error: ConsoleLog): void;
  addNetworkSuccess(tabId: string, request: NetworkRequest): void;
  addNetworkError(tabId: string, request: NetworkRequest): void;

  // Tab operations
  updateActiveTab(tabId: string, data: ActiveTab): void;
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
  MAX_CONSOLE_LOGS: number;
  MAX_CONSOLE_ERRORS: number;
  MAX_NETWORK_SUCCESS: number;
  MAX_NETWORK_ERRORS: number;
  MAX_TAB_EVENTS: number;
  MAX_DEBUGGER_EVENTS: number;
  MAX_MONITOR_STATUS: number;
  MAX_MONITOR_ERRORS: number;
  MAX_EXTENSION_EVENTS: number;
}

// Browser tab information
export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  active: boolean;
  windowId: string;
  favIconUrl?: string;
}

// Browser tabs response
export interface BrowserTabsResponse {
  tabs: BrowserTab[];
  timestamp: number;
}
