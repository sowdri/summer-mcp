/**
 * WebSocket commands
 */
import { WebSocket } from "ws";
import { AggregatorWebSocketSendMessageType } from "../types/index.js";

// Define command types
export enum BrowserCommand {
  LIST_BROWSER_TABS = "listBrowserTabs",
  GET_ACTIVE_BROWSER_TAB = "getActiveBrowserTab",
  ACTIVATE_BROWSER_TAB = "activateBrowserTab",
  TAKE_SCREENSHOT = "takeScreenshot",
  GET_CONSOLE_LOGS = "getConsoleLogs",
  GET_CONSOLE_ERRORS = "getConsoleErrors",
  GET_NETWORK_REQUESTS = "getNetworkRequests",
  GET_SELECTED_ELEMENT = "getSelectedElement",
  CLEAR_LOGS = "clearLogs"
}

// Command message interface
export interface CommandMessage {
  type: AggregatorWebSocketSendMessageType.COMMAND;
  command: BrowserCommand;
  params?: Record<string, any>;
}

// Set of connected clients
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

  const message: CommandMessage = { 
    type: AggregatorWebSocketSendMessageType.COMMAND,
    command 
  };

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
