/**
 * WebSocket commands
 */
import { WebSocket } from "ws";

// Define command types
export type BrowserCommand =
  | "listBrowserTabs"
  | "takeScreenshot"
  | "getConsoleLogs"
  | "getConsoleErrors"
  | "getNetworkRequests"
  | "getSelectedElement"
  | "clearLogs";

// Command message interface
export interface CommandMessage {
  command: BrowserCommand;
  params?: Record<string, any>;
}

// Store connected clients
export const clients = new Set<WebSocket>();

/**
 * Send command to all connected browser extensions
 */
export function sendCommandToExtension(
  command: BrowserCommand,
  params?: Record<string, any>
): void {
  const message: CommandMessage = { command };

  if (params) {
    message.params = params;
  }

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
