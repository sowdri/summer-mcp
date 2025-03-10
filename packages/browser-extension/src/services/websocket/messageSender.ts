import { BrowserMessage } from "@summer-mcp/core";
import { getWebSocket } from "./connection";

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