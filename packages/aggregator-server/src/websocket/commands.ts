/**
 * WebSocket commands
 */
import { ServerCommand } from "@summer-mcp/core";
import { WebSocket } from "ws";

// Set of connected clients
export const clients = new Set<WebSocket>();

/**
 * Send command to all connected browser extensions
 */
export function sendCommandToExtension(
  command: ServerCommand
): boolean {
  // Check if there are any connected clients
  if (clients.size === 0) {
    console.warn(
      `Cannot send command "${command.command}": No connected browser extensions`
    );
    return false;
  }

  let sentToAny = false;
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(command));
      sentToAny = true;
    }
  });

  if (!sentToAny) {
    console.warn(
      `Failed to send command "${command.command}": No clients in OPEN state`
    );
  }

  return sentToAny;
}
