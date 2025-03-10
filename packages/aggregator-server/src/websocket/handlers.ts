/**
 * WebSocket message handlers
 */
import {
  addConsoleLog,
  addDebuggerEvent,
  addExtensionEvent,
  addMonitorError,
  addMonitorStatus,
  addNetworkError,
  addNetworkRequest,
  addTabEvent,
  setSelectedElement,
  updateActiveTab,
} from "../models/browserData.js";
import { handleActiveTabResponse, handleBrowserTabsResponse } from "../services/browserTabs.service.js";
import { handleScreenshotResponse } from "../services/screenshot.service.js";
import {
  ActiveTab,
  BrowserTabsResponse,
  ConsoleLog,
  DebuggerEvent,
  ExtensionEvent,
  MonitorError,
  MonitorStatus,
  NetworkRequest,
  TabEvent,
} from "../types/index.js";
import { 
  BrowserMessageType,
  BrowserMessage,
  BrowserTab
} from "@summer-mcp/core";

// Legacy message type definition (to be deprecated)
type MessageType = BrowserMessageType;

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
        handleScreenshotResponse(parsedMessage.data as string);
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
        // Check if this is an error request
        const networkData = parsedMessage.data as NetworkRequest;
        if (networkData.isError) {
          addNetworkError(networkData);
          console.log(
            "Network error:",
            networkData.method,
            networkData.url,
            networkData.error
          );
        } else {
          addNetworkRequest(networkData);
          console.log(
            "Network request:",
            networkData.method,
            networkData.url
          );
        }
        break;
      case BrowserMessageType.DOM_SNAPSHOT:
        // Store the selected element if present
        const domData = parsedMessage.data as { html: string; selectedElement?: { xpath: string; attributes: Record<string, string> } };
        if (domData.selectedElement) {
          setSelectedElement(domData.selectedElement);
        }
        console.log("Received DOM snapshot, length:", domData.html.length);
        break;
      case BrowserMessageType.BROWSER_TABS:
        // Convert to the expected BrowserTabsResponse format
        const tabsResponse: BrowserTabsResponse = {
          tabs: parsedMessage.data as BrowserTab[],
          timestamp: Date.now()
        };
        handleBrowserTabsResponse(tabsResponse);
        break;
      case BrowserMessageType.ACTIVE_TAB:
        // Convert BrowserTab to ActiveTab
        const tabData = parsedMessage.data as BrowserTab;
        const activeTab: ActiveTab = {
          tabId: tabData.id,
          url: tabData.url || '',
          title: tabData.title || '',
          favIconUrl: tabData.favIconUrl
        };
        handleActiveTabResponse(activeTab);
        break;
      case BrowserMessageType.ACTIVATE_TAB_RESULT:
        // Convert the activate tab result to ActiveTab format
        const resultData = parsedMessage.data as { success: boolean; tabId?: number; error?: string };
        const activeTabData: ActiveTab = {
          tabId: resultData.tabId || 0, // Provide a default value to avoid undefined
          url: '',
          title: '',
          status: resultData.success ? 'active' : 'error',
          error: resultData.error
        };
        updateActiveTab(activeTabData);
        console.log(
          "Activate tab result:",
          resultData.success ? "success" : "failed",
          resultData.tabId
        );
        break;
      default:
        // Log unknown message type
        console.log("Unknown message type:", (parsedMessage as any).type);
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}
