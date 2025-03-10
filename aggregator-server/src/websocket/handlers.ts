/**
 * WebSocket message handlers
 */
import {
  addConsoleLog,
  addDebuggerEvent,
  addExtensionEvent,
  addMonitorError,
  addMonitorStatus,
  addNetworkError,
  addNetworkRequest,
  addTabEvent,
  setSelectedElement,
  updateActiveTab,
} from "../models/browserData.js";
import { handleActiveTabResponse, handleBrowserTabsResponse } from "../services/browserTabs.service.js";
import { handleScreenshotResponse } from "../services/screenshot.service.js";
import {
  ActiveTab,
  BrowserTabsResponse,
  ConsoleLog,
  DebuggerEvent,
  ExtensionEvent,
  MonitorError,
  MonitorStatus,
  NetworkRequest,
  TabEvent,
} from "../types/index.js";

// Define message types
type MessageType =
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

// Base message interface
interface BaseMessage {
  type: MessageType;
  tabId?: string | number;
  timestamp?: number | string;
}

// Type-specific message interfaces
interface ScreenshotMessage extends BaseMessage {
  type: "screenshot";
  data: string;
}

interface ConsoleLogMessage extends BaseMessage {
  type: "console-logs";
  data: ConsoleLog;
}

interface NetworkRequestMessage extends BaseMessage {
  type: "network-requests";
  data: NetworkRequest;
}

interface NetworkErrorMessage extends BaseMessage {
  type: "network-errors";
  data: NetworkRequest;
}

interface DomSnapshotMessage extends BaseMessage {
  type: "dom-snapshot";
  data: any;
}

interface BrowserTabsMessage extends BaseMessage {
  type: "browser-tabs";
  data: BrowserTabsResponse;
}

interface ActiveTabMessage extends BaseMessage {
  type: "active-tab";
  data: ActiveTab;
}

interface TabEventMessage extends BaseMessage {
  type: "tab-event";
  data: TabEvent;
}

interface DebuggerEventMessage extends BaseMessage {
  type: "debugger-event";
  data: DebuggerEvent;
}

interface DebuggerDetachedMessage extends BaseMessage {
  type: "debugger-detached";
  data: DebuggerEvent;
}

interface MonitorStatusMessage extends BaseMessage {
  type: "console-monitor-status" | "network-monitor-status";
  data: MonitorStatus;
}

interface MonitorErrorMessage extends BaseMessage {
  type: "console-monitor-error" | "network-monitor-error";
  data: MonitorError;
}

interface ExtensionEventMessage extends BaseMessage {
  type: "extension-event";
  data: ExtensionEvent;
}

interface ActivateTabResultMessage extends BaseMessage {
  type: "activate-tab-result";
  data: {
    success: boolean;
    tabId?: number;
    error?: string;
  };
}

// Union type of all possible messages
type ExtensionMessage =
  | ScreenshotMessage
  | ConsoleLogMessage
  | NetworkRequestMessage
  | NetworkErrorMessage
  | DomSnapshotMessage
  | BrowserTabsMessage
  | ActiveTabMessage
  | TabEventMessage
  | DebuggerEventMessage
  | DebuggerDetachedMessage
  | MonitorStatusMessage
  | MonitorErrorMessage
  | ExtensionEventMessage
  | ActivateTabResultMessage;

/**
 * Handle messages from browser extension
 */
export function handleWebSocketMessage(message: string): void {
  try {
    const parsedMessage = JSON.parse(message) as ExtensionMessage;
    console.log("Received from extension:", parsedMessage.type);

    // Debug the actual data
    if (parsedMessage.type === "screenshot") {
      console.log("Screenshot data type:", typeof parsedMessage.data);
      console.log(
        "Screenshot data is null or undefined:",
        parsedMessage.data === null || parsedMessage.data === undefined
      );
      if (parsedMessage.data) {
        console.log("Screenshot data length:", parsedMessage.data.length);
        console.log(
          "Screenshot data preview:",
          parsedMessage.data.substring(0, 50) + "..."
        );
      }
    }

    // Process message based on type
    switch (parsedMessage.type) {
      case "screenshot":
        // Handle the async function
        handleScreenshotResponse(parsedMessage.data).catch((error) => {
          console.error("Error handling screenshot response:", error);
        });
        break;
      case "console-logs":
        addConsoleLog(parsedMessage.data);
        break;
      case "network-requests":
        addNetworkRequest(parsedMessage.data);
        break;
      case "network-errors":
        addNetworkError(parsedMessage.data);
        break;
      case "dom-snapshot":
        setSelectedElement(parsedMessage.data);
        break;
      case "browser-tabs":
        handleBrowserTabsResponse(parsedMessage.data);
        break;
      case "active-tab":
        handleActiveTabResponse(parsedMessage.data);
        updateActiveTab(parsedMessage.data);
        console.log(
          "Active tab updated:",
          parsedMessage.data.tabId,
          parsedMessage.data.url
        );
        break;
      case "activate-tab-result":
        console.log(
          "Activate tab result:",
          parsedMessage.data.success ? "Success" : "Failed",
          parsedMessage.data.tabId || "",
          parsedMessage.data.error || ""
        );
        break;
      case "tab-event":
        addTabEvent(parsedMessage.data);
        console.log(
          "Tab event:",
          parsedMessage.data.event,
          parsedMessage.data.tabId
        );
        break;
      case "debugger-event":
        addDebuggerEvent(parsedMessage.data);
        console.log(
          "Debugger event:",
          parsedMessage.data.event,
          parsedMessage.data.tabId
        );
        break;
      case "debugger-detached":
        addDebuggerEvent(parsedMessage.data);
        console.log(
          "Debugger detached:",
          parsedMessage.data.tabId,
          parsedMessage.data.reason
        );
        break;
      case "console-monitor-status":
      case "network-monitor-status":
        addMonitorStatus(parsedMessage.type, parsedMessage.data);
        console.log(
          "Monitor status:",
          parsedMessage.type,
          parsedMessage.data.status
        );
        break;
      case "console-monitor-error":
      case "network-monitor-error":
        addMonitorError(parsedMessage.type, parsedMessage.data);
        console.log(
          "Monitor error:",
          parsedMessage.type,
          parsedMessage.data.error
        );
        break;
      case "extension-event":
        addExtensionEvent(parsedMessage.data);
        console.log("Extension event:", parsedMessage.data.event);
        break;
      default:
        // This should never happen due to type checking
        console.log("Unknown message type:", (parsedMessage as any).type);
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}
