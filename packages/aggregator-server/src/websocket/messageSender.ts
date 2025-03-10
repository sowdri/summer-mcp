/**
 * WebSocket message sender
 */
import { ServerCommand, ServerMessage } from "@summer-mcp/core";
import { WebSocket } from "ws";

// Set of connected clients
export const clients = new Set<WebSocket>();

/**
 * Send command to all connected browser extensions
 */
export function sendCommandToExtension(
  command: ServerCommand
): boolean {
  return sendMessageToExtension(command);
}

/**
 * Send message to all connected browser extensions
 */
export function sendMessageToExtension(
  message: ServerMessage
): boolean {
  // Check if there are any connected clients
  if (clients.size === 0) {
    console.warn(
      `Cannot send message: No connected browser extensions`
    );
    return false;
  }

  let sentToAny = false;
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      sentToAny = true;
    }
  });

  if (!sentToAny) {
    console.warn(
      `Failed to send message: No clients in OPEN state`
    );
  }

  return sentToAny;
} 