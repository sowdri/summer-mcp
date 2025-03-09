/**
 * WebSocket commands
 */
import { WebSocket } from "ws";

// Store connected clients
export const clients = new Set<WebSocket>();

/**
 * Send command to all connected browser extensions
 */
export function sendCommandToExtension(command: string): void {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ command }));
    }
  });
}
