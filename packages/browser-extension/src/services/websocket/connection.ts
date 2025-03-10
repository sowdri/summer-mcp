import {
  BADGE_COLORS,
  BADGE_TEXT,
  RECONNECTION_TIMEOUT,
  SERVER_URL,
} from "../../config/constants";
import { ConnectionStatus, updateConnectionStatus } from "./connectionStatus";
import { processServerMessage } from "./commandReceiver";
import { BrowserMessage } from "@summer-mcp/core";

// WebSocket connection
let socket: WebSocket | null = null;

/**
 * Connect to WebSocket server
 * @returns The WebSocket instance
 */
export function connectWebSocket(): WebSocket | null {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return socket;
  }

  // Update status to checking
  updateConnectionStatus(ConnectionStatus.CHECKING);

  try {
    socket = new WebSocket(SERVER_URL);

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      chrome.action.setBadgeText({ text: BADGE_TEXT.CONNECTED });
      chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.CONNECTED });

      // Update connection status
      updateConnectionStatus(ConnectionStatus.CONNECTED);
    };

    socket.onmessage = (event) => {
      processServerMessage(event.data);
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
      chrome.action.setBadgeText({ text: BADGE_TEXT.DISCONNECTED });
      chrome.action.setBadgeBackgroundColor({
        color: BADGE_COLORS.DISCONNECTED,
      });

      // Update connection status
      updateConnectionStatus(ConnectionStatus.DISCONNECTED);

      // Try to reconnect after timeout
      setTimeout(connectWebSocket, RECONNECTION_TIMEOUT);
    };

    socket.onerror = (event: Event) => {
      console.error("WebSocket error:", event);
      chrome.action.setBadgeText({ text: BADGE_TEXT.ERROR });
      chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.ERROR });

      // Update connection status with error
      updateConnectionStatus(ConnectionStatus.ERROR, "WebSocket connection error");
    };

    return socket;
  } catch (error: unknown) {
    console.error("Error connecting to WebSocket server:", error);
    chrome.action.setBadgeText({ text: BADGE_TEXT.ERROR });
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.ERROR });

    // Update connection status with error
    updateConnectionStatus(
      ConnectionStatus.ERROR, 
      error instanceof Error ? error.message : "Unknown connection error"
    );

    return null;
  }
}

/**
 * Get the current WebSocket instance
 * @returns The WebSocket instance or null if not connected
 */
export function getWebSocket(): WebSocket | null {
  return socket;
}

/**
 * Get the current WebSocket connection state
 * @returns The WebSocket readyState or -1 if not connected
 */
export function getConnectionState(): number {
  return socket ? socket.readyState : -1;
}

/**
 * Send a message to the WebSocket server
 * @param message The browser message to send
 * @returns True if the message was sent, false otherwise
 */
export function sendMessage(message: BrowserMessage): boolean {
  const socket = getWebSocket();
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket not connected");
    return false;
  }

  try {
    socket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
}
