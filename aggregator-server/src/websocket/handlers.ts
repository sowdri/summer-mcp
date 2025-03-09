/**
 * WebSocket message handlers
 */
import {
  addConsoleLog,
  addNetworkRequest,
  setBrowserTabs,
  setScreenshot,
  setSelectedElement,
} from "../models/browserData.js";
import { ConsoleLog, NetworkRequest } from "../types/index.js";

/**
 * Handle messages from browser extension
 */
export function handleWebSocketMessage(message: string): void {
  try {
    const parsedMessage = JSON.parse(message);
    console.log("Received from extension:", parsedMessage.type);

    // Process message based on type
    switch (parsedMessage.type) {
      case "screenshot":
        setScreenshot(parsedMessage.data);
        break;
      case "console-logs":
        addConsoleLog(parsedMessage.data as ConsoleLog);
        break;
      case "network-requests":
        addNetworkRequest(parsedMessage.data as NetworkRequest);
        break;
      case "dom-snapshot":
        setSelectedElement(parsedMessage.data);
        break;
      case "browser-tabs":
        setBrowserTabs(parsedMessage.data);
        break;
      default:
        console.log("Unknown message type:", parsedMessage.type);
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}
