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
import { BrowserWebSocketSendMessageType } from "./types/interfaces";

console.debug("[Background] Background script starting...");
console.debug(`[Background] Server URL: ${SERVER_URL}`);

// Initialize WebSocket connection
console.debug("[Background] 🔌 Initializing WebSocket connection...");
const socket = connectWebSocket();
if (socket) {
  console.debug("[Background] 🌐 WebSocket connection initialized");
} else {
  console.error("[Background] ❌ Failed to initialize WebSocket connection");
}

// Initialize event listeners
console.debug("[Background] 📡 Initializing event listeners...");
initDebuggerEventListeners();
initTabEventListeners();

// Send startup event to aggregator
sendMessage("extension-event", {
  event: "startup",
  version: chrome.runtime.getManifest().version,
  timestamp: new Date().toISOString(),
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.debug(`[Background] Received message from popup: ${message.action}`);

  if (message.action === "getConnectionStatus") {
    // Get current connection data
    const connectionData = getConnectionData();

    // Add WebSocket readyState information
    const wsState = getConnectionState();
    console.debug(`[Background] Current WebSocket state: ${wsState}`);

    // Determine actual status based on WebSocket state
    let status = connectionData.status;
    if (wsState === WebSocket.OPEN) {
      status = ConnectionStatus.CONNECTED;
    } else if (wsState === WebSocket.CONNECTING) {
      status = ConnectionStatus.CHECKING;
    } else if (
      wsState === WebSocket.CLOSED ||
      wsState === WebSocket.CLOSING ||
      wsState === -1
    ) {
      status = ConnectionStatus.DISCONNECTED;
    }

    const response = {
      status,
      serverUrl: SERVER_URL,
      lastConnected: connectionData.lastConnected,
      lastError: connectionData.lastError,
    };

    console.debug(`[Background] Sending connection status: ${status}`);
    sendResponse(response);

    return true; // Keep the message channel open for async response
  }

  if (message.action === "reconnect") {
    console.debug("[Background] Reconnecting to WebSocket server...");

    // Close existing connection if any
    const socket = getWebSocket();
    if (socket) {
      console.debug("[Background] Closing existing WebSocket connection");
      socket.close();
    }

    // Attempt to reconnect
    const newSocket = connectWebSocket();
    const success = !!newSocket;

    console.debug(
      `[Background] Reconnection ${success ? "successful" : "failed"}`
    );
    sendResponse({
      success,
    });

    // Send reconnect event to aggregator if successful
    if (success) {
      sendMessage(BrowserWebSocketSendMessageType.EXTENSION_EVENT, {
        event: "reconnect",
        timestamp: new Date().toISOString(),
      });
    }

    return true; // Keep the message channel open for async response
  }

  // Handle getLogs action
  if (message.action === "getLogs") {
    console.debug("[Background] Getting logs for popup");

    // Send logs event to aggregator
    sendMessage(BrowserWebSocketSendMessageType.EXTENSION_EVENT, {
      event: "get-logs",
      timestamp: new Date().toISOString(),
    });

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
  sendMessage("extension-event", {
    event: "suspend",
    timestamp: new Date().toISOString(),
  });
});

chrome.runtime.onSuspendCanceled.addListener(() => {
  console.debug("[Background] Browser suspend canceled");

  // Send suspend-canceled event to aggregator
  sendMessage("extension-event", {
    event: "suspend-canceled",
    timestamp: new Date().toISOString(),
  });
});

console.debug("[Background] Browser extension background script initialized");
