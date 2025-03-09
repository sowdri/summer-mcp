/**
 * WebSocket message handlers
 */
import {
  addConsoleLog,
  addNetworkRequest,
  setScreenshot,
  setSelectedElement,
} from "../models/browserData.js";
import { handleBrowserTabsResponse } from "../services/browserTabs.service.js";
import {
  BrowserTabsResponse,
  ConsoleLog,
  NetworkRequest,
} from "../types/index.js";

// Define message types
type MessageType =
  | "screenshot"
  | "console-logs"
  | "network-requests"
  | "dom-snapshot"
  | "browser-tabs";

// Base message interface
interface BaseMessage {
  type: MessageType;
  tabId?: string;
  timestamp?: number;
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

interface DomSnapshotMessage extends BaseMessage {
  type: "dom-snapshot";
  data: any;
}

interface BrowserTabsMessage extends BaseMessage {
  type: "browser-tabs";
  data: BrowserTabsResponse;
}

// Union type of all possible messages
type ExtensionMessage =
  | ScreenshotMessage
  | ConsoleLogMessage
  | NetworkRequestMessage
  | DomSnapshotMessage
  | BrowserTabsMessage;

/**
 * Handle messages from browser extension
 */
export function handleWebSocketMessage(message: string): void {
  try {
    const parsedMessage = JSON.parse(message) as ExtensionMessage;
    console.log("Received from extension:", parsedMessage.type);

    // Process message based on type
    switch (parsedMessage.type) {
      case "screenshot":
        setScreenshot(parsedMessage.data);
        break;
      case "console-logs":
        addConsoleLog(parsedMessage.data);
        break;
      case "network-requests":
        addNetworkRequest(parsedMessage.data);
        break;
      case "dom-snapshot":
        setSelectedElement(parsedMessage.data);
        break;
      case "browser-tabs":
        handleBrowserTabsResponse(parsedMessage.data);
        break;
      default:
        // This should never happen due to type checking
        console.log("Unknown message type:", (parsedMessage as any).type);
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}
