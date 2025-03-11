/**
 * Types for messages sent from the browser extension to the server
 */

/**
 * All possible message types that can be sent from the browser to the server
 */
export enum BrowserMessageType {
  SCREENSHOT = "screenshot",
  CONSOLE_LOGS = "console-logs",
  NETWORK_REQUESTS = "network-requests",
  DOM_SNAPSHOT = "dom-snapshot",
  BROWSER_TABS = "browser-tabs",
  ACTIVE_TAB = "active-tab",
  ACTIVATE_TAB_RESULT = "activate-tab-result"
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
  success?: boolean; // Whether the screenshot was successful
  error?: string; // Error message if the screenshot failed
}

/**
 * Console log entry
 */
export interface ConsoleLogEntry {
  level?: string;
  type?: string;
  message?: string;
  timestamp?: number;
  [key: string]: unknown;
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
  isError?: boolean;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Network requests message
 */
export interface NetworkRequestsMessage extends BaseBrowserMessage {
  type: BrowserMessageType.NETWORK_REQUESTS;
  data: NetworkRequest;
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
  success?: boolean; // Whether the DOM snapshot was successful
  error?: string; // Error message if the DOM snapshot failed
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
 * Union type of all possible browser messages
 */
export type BrowserMessage =
  | ScreenshotMessage
  | ConsoleLogsMessage
  | NetworkRequestsMessage
  | DomSnapshotMessage
  | BrowserTabsMessage
  | ActiveTabMessage
  | ActivateTabResultMessage; 