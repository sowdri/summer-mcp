/**
 * Background script for the browser extension
 * This is the entry point for the extension
 */

// Import services
import { SERVER_URL } from "./config/constants";
import { initDebuggerEventListeners } from "./services/debugger/eventHandler";
import { initTabEventListeners } from "./services/tabs/manager";
import {
  connectWebSocket,
  getConnectionState,
  getWebSocket,
  sendMessage,
} from "./services/websocket/connection";
import {
  ConnectionStatus,
  getConnectionData,
} from "./services/websocket/connectionStatus";
import { BrowserMessageType, ExtensionEventMessage } from "@summer-mcp/core";

console.debug("[Background] Background script starting...");
console.debug(`[Background] Server URL: ${SERVER_URL}`);

// Initialize WebSocket connection
console.debug("[Background] 🔌 Initializing WebSocket connection...");
const socket = connectWebSocket();
if (socket) {
  console.debug("[Background] 🌐 WebSocket connection initialized");
  // Send startup event after successful connection
  sendStartupEvent();
} else {
  console.error("[Background] ❌ Failed to initialize WebSocket connection");
}

// Initialize event listeners
console.debug("[Background] 📡 Initializing event listeners...");
initDebuggerEventListeners();
initTabEventListeners();

// Send startup event
function sendStartupEvent() {
  const manifest = chrome.runtime.getManifest();
  const message: ExtensionEventMessage = {
    type: BrowserMessageType.EXTENSION_EVENT,
    data: {
      event: "startup",
      version: manifest.version,
      timestamp: Date.now(),
    },
    timestamp: Date.now()
  };
  sendMessage(message);
}

// Send reconnect event
function sendReconnectEvent() {
  const message: ExtensionEventMessage = {
    type: BrowserMessageType.EXTENSION_EVENT,
    data: {
      event: "reconnect",
      timestamp: Date.now(),
    },
    timestamp: Date.now()
  };
  sendMessage(message);
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug("[Background] Received message from popup:", request);

  if (request.action === "reconnect") {
    // Attempt to reconnect to WebSocket server
    const socket = connectWebSocket();
    const success = !!socket;

    // Send response to popup
    sendResponse({
      success,
      message: success
        ? "Reconnected to WebSocket server"
        : "Failed to reconnect to WebSocket server",
      connectionStatus: getConnectionData(),
    });

    // Send reconnect event to aggregator if successful
    if (success) {
      sendReconnectEvent();
    }

    return true;
  }

  if (request.action === "get-logs") {
    console.debug("[Background] Sending logs request to aggregator");

    // Send logs event to aggregator
    const message: ExtensionEventMessage = {
      type: BrowserMessageType.EXTENSION_EVENT,
      data: {
        event: "get-logs",
        timestamp: Date.now(),
      },
      timestamp: Date.now()
    };
    sendMessage(message);

    sendResponse({
      success: true,
      message: "Logs request sent to aggregator",
    });

    return true;
  }
});

// Listen for browser suspend/resume events
chrome.runtime.onSuspend.addListener(() => {
  console.debug("[Background] Browser suspending extension");

  // Send suspend event to aggregator
  const message: ExtensionEventMessage = {
    type: BrowserMessageType.EXTENSION_EVENT,
    data: {
      event: "suspend",
      timestamp: Date.now(),
    },
    timestamp: Date.now()
  };
  sendMessage(message);
});

chrome.runtime.onSuspendCanceled.addListener(() => {
  console.debug("[Background] Browser suspend canceled");

  // Send suspend-canceled event to aggregator
  const message: ExtensionEventMessage = {
    type: BrowserMessageType.EXTENSION_EVENT,
    data: {
      event: "suspend-canceled",
      timestamp: Date.now(),
    },
    timestamp: Date.now()
  };
  sendMessage(message);
});

console.debug("[Background] Browser extension background script initialized");
