import {
  BADGE_COLORS,
  BADGE_TEXT,
  RECONNECTION_TIMEOUT,
  SERVER_URL,
} from "../../config/constants";
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

  socket = new WebSocket(SERVER_URL);

  socket.onopen = () => {
    console.log("Connected to WebSocket server");
    chrome.action.setBadgeText({ text: BADGE_TEXT.CONNECTED });
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.CONNECTED });
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Received message from server:", message);

      // Handle commands from the server
      if (message.command) {
        handleServerCommand(message);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  socket.onclose = () => {
    console.log("Disconnected from WebSocket server");
    chrome.action.setBadgeText({ text: BADGE_TEXT.DISCONNECTED });
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.DISCONNECTED });

    // Try to reconnect after timeout
    setTimeout(connectWebSocket, RECONNECTION_TIMEOUT);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    chrome.action.setBadgeText({ text: BADGE_TEXT.ERROR });
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.ERROR });
  };

  return socket;
}

/**
 * Get the current WebSocket instance
 * @returns The current WebSocket instance
 */
export function getWebSocket(): WebSocket | null {
  return socket;
}

/**
 * Send a message to the server
 * @param type Message type
 * @param data Message data
 * @returns Whether the message was sent successfully
 */
export function sendMessage(type: string, data: any): boolean {
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
