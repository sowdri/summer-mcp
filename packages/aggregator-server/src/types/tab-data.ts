/**
 * Tab data types for the aggregator server
 */

import { ConsoleLogEntry, NetworkRequest, BrowserTab } from "@summer-mcp/core";

// Alias types from core for backward compatibility
export type ConsoleLog = ConsoleLogEntry;

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
  consoleLogs: ConsoleLog[]; // All console logs including errors and warnings
  networkRequests: {
    success: NetworkRequest[];
    errors: NetworkRequest[];
  };
  selectedElement: any | null;
  activeTab?: BrowserTab; // Using BrowserTab directly from core
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