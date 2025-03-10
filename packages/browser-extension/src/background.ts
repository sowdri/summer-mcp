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
} from "./websocket/connection";
import {
  getConnectionData,
} from "./websocket/connectionStatus";

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

    return true;
  }

  if (request.action === "get-logs") {
    console.debug("[Background] Sending logs request to aggregator");

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
});

chrome.runtime.onSuspendCanceled.addListener(() => {
  console.debug("[Background] Browser suspend canceled");
});

console.debug("[Background] Browser extension background script initialized");
