/**
 * Type definitions for the aggregator server
 */

// Import types from core package
import {
  BrowserMessageType,
  BrowserMessage,
  ServerCommandType,
  ServerCommand,
  ServerMessage,
  ConsoleLogEntry as CoreConsoleLog,
  NetworkRequest as CoreNetworkRequest,
  BrowserTab
} from "@summer-mcp/core";

// Re-export types from core package
export {
  BrowserMessageType,
  BrowserMessage,
  ServerCommandType,
  ServerCommand,
  ServerMessage,
  BrowserTab
};

/**
 * Message types sent from aggregator server to browser extension
 */
export enum AggregatorWebSocketSendMessageType {
  CONNECTION = "connection",
  COMMAND = "command"
}

/**
 * Message types received by aggregator server from browser extension
 */
export type AggregatorWebSocketReceiveMessageType = BrowserMessageType;

// Alias types from core for backward compatibility
export type ConsoleLog = CoreConsoleLog;
export type NetworkRequest = CoreNetworkRequest;

// Tab data interfaces specific to the aggregator server
export interface ActiveTab {
  tabId: number | string;
  url?: string;
  title?: string;
  favIconUrl?: string;
  timestamp?: number | string;
  [key: string]: any;
}

export interface TabEvent {
  event: string; // 'removed', 'updated', etc.
  tabId: number | string;
  timestamp?: number | string;
  [key: string]: any;
}

export interface DebuggerEvent {
  event: string; // 'attached', 'detached', etc.
  tabId: number | string;
  reason?: string;
  timestamp?: number | string;
  [key: string]: any;
}

export interface MonitorStatus {
  tabId: number | string;
  status: string; // 'started', 'stopped', etc.
  timestamp?: number | string;
  [key: string]: any;
}

export interface MonitorError {
  tabId: number | string;
  error: string;
  timestamp?: number | string;
  [key: string]: any;
}

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

// Browser tabs response
export interface BrowserTabsResponse {
  tabs: BrowserTab[];
  timestamp: number;
}
