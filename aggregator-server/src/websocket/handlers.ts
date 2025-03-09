/**
 * WebSocket message handlers
 */
import {
  addConsoleLog,
  addNetworkRequest,
  setSelectedElement,
} from "../models/browserData.js";
import { handleBrowserTabsResponse } from "../services/browserTabs.service.js";
import { handleScreenshotResponse } from "../services/screenshot.service.js";
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
