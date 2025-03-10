// Debugger connection state
export interface DebuggerConnection {
  tabId: number;
  attached: boolean;
}

// Import the BrowserCommand enum from messageHandler
import { BrowserCommand } from "../services/websocket/messageHandler";

// Server command message
export interface ServerCommand {
  command: BrowserCommand | string;
  params?: Record<string, any>;
}

/**
 * Message types sent from browser extension to aggregator server
 */
export enum BrowserWebSocketSendMessageType {
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
 * Message types received by browser extension from aggregator server
 */
export enum BrowserWebSocketReceiveMessageType {
  CONNECTION = "connection",
  COMMAND = "command"
}

// Legacy message types for WebSocket communication (to be deprecated)
export type MessageType =
  | "screenshot"
  | "console-logs"
  | "network-requests"
  | "network-errors"
  | "dom-snapshot"
  | "browser-tabs"
  | "active-tab"
  | "activate-tab-result"
  | "tab-event"
  | "debugger-event"
  | "debugger-detached"
  | "console-monitor-status"
  | "network-monitor-status"
  | "console-monitor-error"
  | "network-monitor-error"
  | "extension-event";

// Message structure for sending data to the server
export interface WebSocketMessage {
  type: BrowserWebSocketSendMessageType;
  data: any;
}
