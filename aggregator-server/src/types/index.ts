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

// Tab-specific browser data
export interface TabData {
  consoleLogs: ConsoleLog[];
  consoleErrors: ConsoleLog[];
  networkRequests: {
    success: NetworkRequest[];
    errors: NetworkRequest[];
  };
  selectedElement: any | null;
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
