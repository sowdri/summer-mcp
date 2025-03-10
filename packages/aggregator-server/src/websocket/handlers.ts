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
        handleScreenshotResponse(parsedMessage.data);
        break;
      case BrowserMessageType.CONSOLE_LOGS:
        // Add each console log to the store with the specific tabId
        if (parsedMessage.tabId) {
          const tabId = String(parsedMessage.tabId);
          parsedMessage.data.forEach((log) => {
            addConsoleLog(tabId, log as ConsoleLog);
          });
          console.log(
            `Received console logs for tab ${tabId}:`,
            parsedMessage.data.length,
            "entries"
          );
        } else {
          console.warn("Received console logs without tabId, using default");
          parsedMessage.data.forEach((log) => {
            addConsoleLog("default", log as ConsoleLog);
          });
        }
        break;
      case BrowserMessageType.NETWORK_REQUESTS:
        // Check if this is an error request
        if (parsedMessage.data.isError) {
          addNetworkError(parsedMessage.data as NetworkRequest);
          console.log(
            "Network error:",
            parsedMessage.data.method,
            parsedMessage.data.url,
            parsedMessage.data.error
          );
        } else {
          addNetworkRequest(parsedMessage.data as NetworkRequest);
          console.log(
            "Network request:",
            parsedMessage.data.method,
            parsedMessage.data.url
          );
        }
        break;
      case BrowserMessageType.DOM_SNAPSHOT:
        // Store the selected element if present
        if (parsedMessage.data.selectedElement) {
          setSelectedElement(parsedMessage.data.selectedElement);
        }
        console.log("Received DOM snapshot, length:", parsedMessage.data.html.length);
        break;
      case BrowserMessageType.BROWSER_TABS:
        // Convert to the expected BrowserTabsResponse format
        const tabsResponse: BrowserTabsResponse = {
          tabs: parsedMessage.data,
          timestamp: Date.now()
        };
        handleBrowserTabsResponse(tabsResponse);
        break;
      case BrowserMessageType.ACTIVE_TAB:
        // Convert BrowserTab to ActiveTab
        const activeTab: ActiveTab = {
          tabId: parsedMessage.data.id,
          url: parsedMessage.data.url || '',
          title: parsedMessage.data.title || '',
          favIconUrl: parsedMessage.data.favIconUrl
        };
        handleActiveTabResponse(activeTab);
        break;
      case BrowserMessageType.ACTIVATE_TAB_RESULT:
        // Convert the activate tab result to ActiveTab format
        const activeTabData: ActiveTab = {
          tabId: parsedMessage.data.tabId || 0, // Provide a default value to avoid undefined
          url: '',
          title: '',
          status: parsedMessage.data.success ? 'active' : 'error',
          error: parsedMessage.data.error
        };
        updateActiveTab(activeTabData);
        console.log(
          "Activate tab result:",
          parsedMessage.data.success ? "success" : "failed",
          parsedMessage.data.tabId
        );
        break;
      case BrowserMessageType.TAB_EVENT:
        // Convert to the expected TabEvent format
        const tabEvent: TabEvent = {
          ...parsedMessage.data,
          event: parsedMessage.data.event,
          tabId: parsedMessage.data.tabId
        };
        addTabEvent(tabEvent);
        console.log("Tab event:", parsedMessage.data.event);
        break;
      case BrowserMessageType.DEBUGGER_EVENT:
        // Convert to the expected DebuggerEvent format
        const debuggerEvent: DebuggerEvent = {
          ...parsedMessage.data,
          event: parsedMessage.data.method,
          tabId: parsedMessage.tabId || 'unknown'
        };
        addDebuggerEvent(debuggerEvent);
        console.log("Debugger event:", parsedMessage.data.method);
        break;
      case BrowserMessageType.DEBUGGER_DETACHED:
        console.log("Debugger detached:", parsedMessage.data.reason);
        break;
      case BrowserMessageType.CONSOLE_MONITOR_STATUS:
      case BrowserMessageType.NETWORK_MONITOR_STATUS:
        // Convert to the expected MonitorStatus format
        const monitorStatus: MonitorStatus = {
          ...parsedMessage.data,
          tabId: parsedMessage.tabId || 'unknown',
          status: parsedMessage.data.status
        };
        addMonitorStatus(parsedMessage.type, monitorStatus);
        console.log(
          "Monitor status:",
          parsedMessage.type,
          parsedMessage.data.status
        );
        break;
      case BrowserMessageType.CONSOLE_MONITOR_ERROR:
      case BrowserMessageType.NETWORK_MONITOR_ERROR:
        // Convert to the expected MonitorError format
        const monitorError: MonitorError = {
          ...parsedMessage.data,
          tabId: parsedMessage.tabId || 'unknown',
          error: parsedMessage.data.error
        };
        addMonitorError(parsedMessage.type, monitorError);
        console.log(
          "Monitor error:",
          parsedMessage.type,
          parsedMessage.data.error
        );
        break;
      case BrowserMessageType.EXTENSION_EVENT:
        // Convert to the expected ExtensionEvent format
        const extensionEvent: ExtensionEvent = {
          ...parsedMessage.data,
          event: parsedMessage.data.event,
          version: parsedMessage.data.version
        };
        addExtensionEvent(extensionEvent);
        console.log("Extension event:", parsedMessage.data.event);
        break;
      default:
        // This should never happen due to type checking
        console.log("Unknown message type:", (parsedMessage as any).type);
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}
