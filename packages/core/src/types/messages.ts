/**
 * Types for messages sent from the browser extension to the server
 */

/**
 * All possible message types that can be sent from the browser to the server
 */
export enum BrowserMessageType {
  SCREENSHOT = "screenshot",
  CONSOLE_LOGS = "console-logs",
  CONSOLE_ERRORS = "console-errors",
  NETWORK_REQUESTS = "network-requests",
  NETWORK_ERRORS = "network-errors",
  DOM_SNAPSHOT = "dom-snapshot",
  BROWSER_TABS = "browser-tabs",
  ACTIVE_TAB = "active-tab",
  ACTIVATE_TAB_RESULT = "activate-tab-result",
  TAB_EVENT = "tab-event",
  DEBUGGER_EVENT = "debugger-event",
  DEBUGGER_DETACHED = "debugger-detached",
  CONSOLE_MONITOR_STATUS = "console-monitor-status",
  NETWORK_MONITOR_STATUS = "network-monitor-status",
  CONSOLE_MONITOR_ERROR = "console-monitor-error",
  NETWORK_MONITOR_ERROR = "network-monitor-error",
  EXTENSION_EVENT = "extension-event"
}

/**
 * Base interface for all browser messages
 */
export interface BaseBrowserMessage {
  type: BrowserMessageType;
  timestamp?: string | number;
  tabId?: string | number;
}

/**
 * Browser tab information
 */
export interface BrowserTab {
  id: string | number;
  url?: string;
  title?: string;
  active: boolean;
  windowId: string | number;
  index: number;
  favIconUrl?: string;
}

/**
 * Screenshot message
 */
export interface ScreenshotMessage extends BaseBrowserMessage {
  type: BrowserMessageType.SCREENSHOT;
  data: string; // Base64 encoded image
}

/**
 * Console log entry
 */
export interface ConsoleLogEntry {
  level?: string;
  type?: string;
  message?: string;
  timestamp?: number;
  [key: string]: any;
}

/**
 * Console logs message
 */
export interface ConsoleLogsMessage extends BaseBrowserMessage {
  type: BrowserMessageType.CONSOLE_LOGS;
  data: ConsoleLogEntry[];
  tabId: string | number;
}

/**
 * Console errors message
 */
export interface ConsoleErrorsMessage extends BaseBrowserMessage {
  type: BrowserMessageType.CONSOLE_ERRORS;
  data: ConsoleLogEntry[];
  tabId: string | number;
}

/**
 * Network request information
 */
export interface NetworkRequest {
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  type?: string;
  timestamp?: number;
  duration?: number;
  size?: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  [key: string]: any;
}

/**
 * Network requests message
 */
export interface NetworkRequestsMessage extends BaseBrowserMessage {
  type: BrowserMessageType.NETWORK_REQUESTS;
  data: NetworkRequest;
}

/**
 * Network errors message
 */
export interface NetworkErrorsMessage extends BaseBrowserMessage {
  type: BrowserMessageType.NETWORK_ERRORS;
  data: NetworkRequest & { error: string };
}

/**
 * DOM snapshot message
 */
export interface DomSnapshotMessage extends BaseBrowserMessage {
  type: BrowserMessageType.DOM_SNAPSHOT;
  data: {
    html: string;
    selectedElement?: {
      xpath: string;
      attributes: Record<string, string>;
    };
  };
}

/**
 * Browser tabs message
 */
export interface BrowserTabsMessage extends BaseBrowserMessage {
  type: BrowserMessageType.BROWSER_TABS;
  data: BrowserTab[];
}

/**
 * Active tab message
 */
export interface ActiveTabMessage extends BaseBrowserMessage {
  type: BrowserMessageType.ACTIVE_TAB;
  data: BrowserTab;
}

/**
 * Activate tab result message
 */
export interface ActivateTabResultMessage extends BaseBrowserMessage {
  type: BrowserMessageType.ACTIVATE_TAB_RESULT;
  data: {
    success: boolean;
    tabId?: number;
    error?: string;
  };
}

/**
 * Tab event message
 */
export interface TabEventMessage extends BaseBrowserMessage {
  type: BrowserMessageType.TAB_EVENT;
  data: {
    event: string; // 'created', 'updated', 'removed', etc.
    tabId: string | number;
    [key: string]: any;
  };
}

/**
 * Debugger event message
 */
export interface DebuggerEventMessage extends BaseBrowserMessage {
  type: BrowserMessageType.DEBUGGER_EVENT;
  data: {
    method: string;
    params?: any;
    [key: string]: any;
  };
}

/**
 * Debugger detached message
 */
export interface DebuggerDetachedMessage extends BaseBrowserMessage {
  type: BrowserMessageType.DEBUGGER_DETACHED;
  data: {
    reason: string;
  };
}

/**
 * Monitor status information
 */
export interface MonitorStatus {
  status: string; // 'started', 'stopped', etc.
  [key: string]: any;
}

/**
 * Console monitor status message
 */
export interface ConsoleMonitorStatusMessage extends BaseBrowserMessage {
  type: BrowserMessageType.CONSOLE_MONITOR_STATUS;
  data: MonitorStatus;
}

/**
 * Network monitor status message
 */
export interface NetworkMonitorStatusMessage extends BaseBrowserMessage {
  type: BrowserMessageType.NETWORK_MONITOR_STATUS;
  data: MonitorStatus;
}

/**
 * Monitor error information
 */
export interface MonitorError {
  error: string;
  [key: string]: any;
}

/**
 * Console monitor error message
 */
export interface ConsoleMonitorErrorMessage extends BaseBrowserMessage {
  type: BrowserMessageType.CONSOLE_MONITOR_ERROR;
  data: MonitorError;
}

/**
 * Network monitor error message
 */
export interface NetworkMonitorErrorMessage extends BaseBrowserMessage {
  type: BrowserMessageType.NETWORK_MONITOR_ERROR;
  data: MonitorError;
}

/**
 * Extension event message
 */
export interface ExtensionEventMessage extends BaseBrowserMessage {
  type: BrowserMessageType.EXTENSION_EVENT;
  data: {
    event: string; // 'startup', 'reconnect', 'suspend', etc.
    version?: string;
    [key: string]: any;
  };
}

/**
 * Union type of all possible browser messages
 */
export type BrowserMessage =
  | ScreenshotMessage
  | ConsoleLogsMessage
  | ConsoleErrorsMessage
  | NetworkRequestsMessage
  | NetworkErrorsMessage
  | DomSnapshotMessage
  | BrowserTabsMessage
  | ActiveTabMessage
  | ActivateTabResultMessage
  | TabEventMessage
  | DebuggerEventMessage
  | DebuggerDetachedMessage
  | ConsoleMonitorStatusMessage
  | NetworkMonitorStatusMessage
  | ConsoleMonitorErrorMessage
  | NetworkMonitorErrorMessage
  | ExtensionEventMessage; 