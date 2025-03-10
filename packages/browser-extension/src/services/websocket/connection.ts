import {
  BADGE_COLORS,
  BADGE_TEXT,
  RECONNECTION_TIMEOUT,
  SERVER_URL,
} from "../../config/constants";
import { BrowserWebSocketReceiveMessageType, BrowserWebSocketSendMessageType, ServerCommand } from "../../types/interfaces";
import { ConnectionStatus, updateConnectionStatus } from "./connectionStatus";
import { handleServerCommand } from "./messageHandler";

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
      try {
        const message = JSON.parse(event.data);
        console.log("Received message from server:", message);

        // Handle messages based on type
        if (message.type === BrowserWebSocketReceiveMessageType.COMMAND) {
          handleServerCommand(message as ServerCommand);
        } else if (message.type === BrowserWebSocketReceiveMessageType.CONNECTION) {
          console.log("Connection status:", message.status);
        } else {
          console.warn("Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
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
 * Send a message to the server
 * @param type Message type
 * @param data Message data
 * @returns Whether the message was sent successfully
 */
export function sendMessage(
  type: BrowserWebSocketSendMessageType,
  data: any
): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  socket.send(
    JSON.stringify({
      type,
      data,
    })
  );

  return true;
}
