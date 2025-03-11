import { sendMessage } from "../websocket/messageSender";
import { 
  BrowserMessageType, 
  ActivateTabResultMessage,
  ActivateBrowserTabCommand
} from "@summer-mcp/core";

/**
 * Activate a browser tab by ID
 * @param command The ActivateBrowserTabCommand object
 */
export function activateBrowserTab(command: ActivateBrowserTabCommand): void {
  const tabId = command.params?.tabId;

  // Handle missing tabId parameter
  if (!tabId) {
    const errorMessage = "Missing tab ID parameter";
    console.error(`[Browser Tabs] ${errorMessage}`);
    
    // Send error response
    const message: ActivateTabResultMessage = {
      type: BrowserMessageType.ACTIVATE_TAB_RESULT,
      data: {
        success: false,
        tabId: undefined,
        error: errorMessage
      },
      timestamp: Date.now()
    };

    sendMessage(message);
    return;
  }

  const numericTabId = parseInt(tabId, 10);
  
  if (isNaN(numericTabId)) {
    const errorMessage = `Invalid tab ID: ${tabId}`;
    console.error(`[Browser Tabs] ${errorMessage}`);
    
    // Send error response
    const message: ActivateTabResultMessage = {
      type: BrowserMessageType.ACTIVATE_TAB_RESULT,
      data: {
        success: false,
        tabId: undefined,
        error: errorMessage
      },
      timestamp: Date.now()
    };

    sendMessage(message);
    return;
  }

  chrome.tabs.update(numericTabId, { active: true }, (tab) => {
    const success = !!tab;
    
    const message: ActivateTabResultMessage = {
      type: BrowserMessageType.ACTIVATE_TAB_RESULT,
      data: {
        success,
        tabId: numericTabId,
        error: success ? undefined : `Failed to activate tab ${tabId}`
      },
      timestamp: Date.now()
    };

    sendMessage(message);
    console.debug(
      `[Browser Tabs] ${success ? "Tab activated successfully" : "Failed to activate tab"}: ${tabId}`
    );
  });
} 