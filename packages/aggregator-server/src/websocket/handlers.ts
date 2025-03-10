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
import { BrowserMessageType } from "@summer-mcp/core";

// Legacy message type definition (to be deprecated)
type MessageType = BrowserMessageType;

// Base message interface
interface BaseMessage {
  type: BrowserMessageType;
  tabId?: string | number;
  timestamp?: number | string;
}

// Message interfaces
interface ScreenshotMessage extends BaseMessage {
  type: BrowserMessageType.SCREENSHOT;
  data: string; // Base64 encoded image
}

interface ConsoleLogMessage extends BaseMessage {
  type: BrowserMessageType.CONSOLE_LOGS;
  data: ConsoleLog[];
}

interface NetworkRequestMessage extends BaseMessage {
  type: BrowserMessageType.NETWORK_REQUESTS;
  data: NetworkRequest;
}

interface NetworkErrorMessage extends BaseMessage {
  type: BrowserMessageType.NETWORK_ERRORS;
  data: NetworkRequest;
}

interface DomSnapshotMessage extends BaseMessage {
  type: BrowserMessageType.DOM_SNAPSHOT;
  data: {
    html: string;
    selectedElement?: {
      xpath: string;
      attributes: Record<string, string>;
    };
  };
}

interface BrowserTabsMessage extends BaseMessage {
  type: BrowserMessageType.BROWSER_TABS;
  data: BrowserTabsResponse;
}

interface ActiveTabMessage extends BaseMessage {
  type: BrowserMessageType.ACTIVE_TAB;
  data: ActiveTab;
}

interface TabEventMessage extends BaseMessage {
  type: BrowserMessageType.TAB_EVENT;
  data: TabEvent;
}

interface DebuggerEventMessage extends BaseMessage {
  type: BrowserMessageType.DEBUGGER_EVENT;
  data: DebuggerEvent;
}

interface DebuggerDetachedMessage extends BaseMessage {
  type: BrowserMessageType.DEBUGGER_DETACHED;
  data: {
    reason: string;
  };
}

interface MonitorStatusMessage extends BaseMessage {
  type: BrowserMessageType.CONSOLE_MONITOR_STATUS | BrowserMessageType.NETWORK_MONITOR_STATUS;
  data: MonitorStatus;
}

interface MonitorErrorMessage extends BaseMessage {
  type: BrowserMessageType.CONSOLE_MONITOR_ERROR | BrowserMessageType.NETWORK_MONITOR_ERROR;
  data: MonitorError;
}

interface ExtensionEventMessage extends BaseMessage {
  type: BrowserMessageType.EXTENSION_EVENT;
  data: ExtensionEvent;
}

interface ActivateTabResultMessage extends BaseMessage {
  type: BrowserMessageType.ACTIVATE_TAB_RESULT;
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
 * @param message The message received from the browser extension
 */
export function handleWebSocketMessage(message: string): void {
  try {
    const parsedMessage = JSON.parse(message) as ExtensionMessage;

    // Add timestamp if not present
    if (!parsedMessage.timestamp) {
      parsedMessage.timestamp = new Date().toISOString();
    }

    // Process message based on type
    switch (parsedMessage.type) {
      case BrowserMessageType.SCREENSHOT:
        handleScreenshotResponse(parsedMessage.data);
        break;
      case BrowserMessageType.CONSOLE_LOGS:
        // Add each console log to the store
        parsedMessage.data.forEach((log) => {
          addConsoleLog(log);
        });
        console.log(
          "Received console logs:",
          parsedMessage.data.length,
          "entries"
        );
        break;
      case BrowserMessageType.NETWORK_REQUESTS:
        addNetworkRequest(parsedMessage.data);
        console.log(
          "Network request:",
          parsedMessage.data.method,
          parsedMessage.data.url
        );
        break;
      case BrowserMessageType.NETWORK_ERRORS:
        addNetworkError(parsedMessage.data);
        console.log(
          "Network error:",
          parsedMessage.data.method,
          parsedMessage.data.url,
          parsedMessage.data.error
        );
        break;
      case BrowserMessageType.DOM_SNAPSHOT:
        // Store the selected element if present
        if (parsedMessage.data.selectedElement) {
          setSelectedElement(parsedMessage.data.selectedElement);
        }
        console.log("Received DOM snapshot, length:", parsedMessage.data.html.length);
        break;
      case BrowserMessageType.BROWSER_TABS:
        handleBrowserTabsResponse(parsedMessage.data);
        break;
      case BrowserMessageType.ACTIVE_TAB:
        handleActiveTabResponse(parsedMessage.data);
        break;
      case BrowserMessageType.ACTIVATE_TAB_RESULT:
        // Convert the activate tab result to ActiveTab format
        const activeTabData: ActiveTab = {
          tabId: parsedMessage.data.tabId || 0, // Provide a default value to avoid undefined
          url: '',
          title: '',
          status: parsedMessage.data.success ? 'active' : 'error',
          error: parsedMessage.data.error
        };
        updateActiveTab(activeTabData);
        console.log(
          "Activate tab result:",
          parsedMessage.data.success ? "success" : "failed",
          parsedMessage.data.tabId
        );
        break;
      case BrowserMessageType.TAB_EVENT:
        addTabEvent(parsedMessage.data);
        console.log("Tab event:", parsedMessage.data.event);
        break;
      case BrowserMessageType.DEBUGGER_EVENT:
        addDebuggerEvent(parsedMessage.data);
        console.log("Debugger event:", parsedMessage.data.method);
        break;
      case BrowserMessageType.DEBUGGER_DETACHED:
        console.log("Debugger detached:", parsedMessage.data.reason);
        break;
      case BrowserMessageType.CONSOLE_MONITOR_STATUS:
      case BrowserMessageType.NETWORK_MONITOR_STATUS:
        addMonitorStatus(parsedMessage.type, parsedMessage.data);
        console.log(
          "Monitor status:",
          parsedMessage.type,
          parsedMessage.data.status
        );
        break;
      case BrowserMessageType.CONSOLE_MONITOR_ERROR:
      case BrowserMessageType.NETWORK_MONITOR_ERROR:
        addMonitorError(parsedMessage.type, parsedMessage.data);
        console.log(
          "Monitor error:",
          parsedMessage.type,
          parsedMessage.data.error
        );
        break;
      case BrowserMessageType.EXTENSION_EVENT:
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
