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
} from "./services/websocket/connection";
import {
  ConnectionStatus,
  getConnectionData,
} from "./services/websocket/connectionStatus";

// Initialize WebSocket connection
connectWebSocket();

// Initialize event listeners
initDebuggerEventListeners();
initTabEventListeners();

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getConnectionStatus") {
    // Get current connection data
    const connectionData = getConnectionData();

    // Add WebSocket readyState information
    const wsState = getConnectionState();

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

    sendResponse({
      status,
      serverUrl: SERVER_URL,
      lastConnected: connectionData.lastConnected,
      lastError: connectionData.lastError,
    });

    return true; // Keep the message channel open for async response
  }

  if (message.action === "reconnect") {
    // Close existing connection if any
    const socket = getWebSocket();
    if (socket) {
      socket.close();
    }

    // Attempt to reconnect
    const newSocket = connectWebSocket();

    sendResponse({
      success: !!newSocket,
    });

    return true; // Keep the message channel open for async response
  }
});

console.log("Browser extension background script initialized");
