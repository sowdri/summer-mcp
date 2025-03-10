/**
 * WebSocket commands
 */
import { WebSocket } from "ws";

// Define command types
export type BrowserCommand =
  | "listBrowserTabs"
  | "getActiveBrowserTab"
  | "activateBrowserTab"
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
): boolean {
  // Check if there are any connected clients
  if (clients.size === 0) {
    console.warn(
      `Cannot send command "${command}": No connected browser extensions`
    );
    return false;
  }

  const message: CommandMessage = { command };

  if (params) {
    message.params = params;
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
      `Failed to send command "${command}": No clients in OPEN state`
    );
  }

  return sentToAny;
}
