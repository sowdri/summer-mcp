/**
 * WebSocket message receiver
 */
import {
  addConsoleLog,
  addNetworkRequest,
  updateActiveTab,
} from "../data/browserData";
import { handleGetBrowserTabsResponse } from "../bridges/GetBrowserTabsBridge";
import { handleGetActiveTabResponse } from "../bridges/GetActiveTabBridge";
import { handleScreenshotResponse } from "../bridges/TakeScreenshotBridge";
import {
  ConsoleLog,
  BrowserMessageType,
  NetworkRequest,
  BrowserMessage,
  ScreenshotMessage,
  BrowserTabsMessage,
  ActiveTabMessage
} from "@summer-mcp/core";

/**
 * Handle messages from browser extension
 * @param message The message received from the browser extension
 */
export function handleWebSocketMessage(message: string): void {
  try {
    const parsedMessage = JSON.parse(message) as BrowserMessage;

    // Add timestamp if not present
    if (!parsedMessage.timestamp) {
      parsedMessage.timestamp = new Date().toISOString();
    }

    // Process message based on type
    switch (parsedMessage.type) {
      case BrowserMessageType.SCREENSHOT:
        // Pass the entire ScreenshotMessage object
        handleScreenshotResponse(parsedMessage as ScreenshotMessage);
        break;
      case BrowserMessageType.CONSOLE_LOGS:
        // Add each console log to the store with the specific tabId
        if (parsedMessage.tabId) {
          const tabId = String(parsedMessage.tabId);
          (parsedMessage.data as ConsoleLog[]).forEach((log) => {
            addConsoleLog(tabId, log as ConsoleLog);
          });
          console.log(
            `Received console logs for tab ${tabId}:`,
            (parsedMessage.data as ConsoleLog[]).length,
            "entries"
          );
        } else {
          console.warn("Received console logs without tabId, using default");
          (parsedMessage.data as ConsoleLog[]).forEach((log) => {
            addConsoleLog("default", log as ConsoleLog);
          });
        }
        break;
      case BrowserMessageType.NETWORK_REQUESTS:
        // Add the network request to the store
        const networkData = parsedMessage.data as NetworkRequest;
        addNetworkRequest(networkData);
        console.log(
          networkData.isError ? "Network error:" : "Network request:",
          networkData.method,
          networkData.url
        );
        break;
      case BrowserMessageType.DOM_SNAPSHOT:
        // Store the DOM snapshot
        const domData = parsedMessage.data as { html: string };
        console.log("Received DOM snapshot, length:", domData.html.length);
        break;
      case BrowserMessageType.BROWSER_TABS:
        // Pass the BrowserTabsMessage to the bridge
        handleGetBrowserTabsResponse(parsedMessage as BrowserTabsMessage);
        break;
      case BrowserMessageType.ACTIVE_TAB:
        // Pass the ActiveTabMessage to the bridge
        handleGetActiveTabResponse(parsedMessage as ActiveTabMessage);
        break;
      case BrowserMessageType.ACTIVATE_TAB_RESULT:
        // Convert the activate tab result to BrowserTab format with additional properties
        const resultData = parsedMessage.data as { success: boolean; tabId?: number; error?: string };
        // Create a custom object that includes both BrowserTab properties and additional properties
        const activeTabData = {
          id: resultData.tabId || 0, // Provide a default value to avoid undefined
          url: '',
          title: '',
          active: resultData.success,
          windowId: 0,
          index: 0,
          favIconUrl: '',
          // Additional properties
          success: resultData.success,
          error: resultData.error
        };
        // Pass the data to the updateActiveTab function
        updateActiveTab(activeTabData);
        console.log(
          "Activate tab result:",
          resultData.success ? "success" : "failed",
          resultData.tabId
        );
        break;
      default:
        // Log unknown message type
        console.log("Unknown message type:", (parsedMessage as BrowserMessage).type);
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
} 