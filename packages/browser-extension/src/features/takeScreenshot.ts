import { sendMessage } from "../websocket/messageSender";
import { BrowserMessageType, ScreenshotMessage, TakeScreenshotCommand } from "@summer-mcp/core";

/**
 * Take a screenshot of a specific tab or the active tab
 * @param command The TakeScreenshotCommand object
 */
export function takeScreenshot(command: TakeScreenshotCommand): void {
  const tabId = command.params?.tabId ? Number(command.params.tabId) : undefined;

  if (tabId) {
    // If a specific tab ID is provided, check if it's active
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendErrorMessage("No active tab found", tabId);
        return;
      }

      const activeTabId = tabs[0].id;
      
      if (activeTabId === tabId) {
        // The requested tab is already active, take screenshot
        captureScreenshot(tabId);
      } else {
        // Need to activate the requested tab first
        activateTabAndCapture(tabId);
      }
    });
  } else {
    // No specific tab ID provided, use the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].id) {
        sendErrorMessage("No active tab found");
        return;
      }

      captureScreenshot(tabs[0].id);
    });
  }
}

/**
 * Activate a tab and then capture a screenshot
 * @param tabId The ID of the tab to activate and capture
 */
function activateTabAndCapture(tabId: number): void {
  chrome.tabs.update(tabId, { active: true }, (tab) => {
    if (chrome.runtime.lastError) {
      sendErrorMessage(`Failed to activate tab: ${chrome.runtime.lastError.message}`, tabId);
      return;
    }

    if (!tab) {
      sendErrorMessage(`Tab ${tabId} not found`, tabId);
      return;
    }

    // Give the tab a moment to become fully active before capturing
    setTimeout(() => {
      captureScreenshot(tabId);
    }, 300);
  });
}

/**
 * Capture a screenshot of the specified tab
 * @param tabId The ID of the tab to capture
 */
function captureScreenshot(tabId: number): void {
  try {
    // Use the correct type for the first parameter (windowId)
    chrome.tabs.captureVisibleTab(
      chrome.windows.WINDOW_ID_CURRENT,
      { format: "png" },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendErrorMessage(`Failed to capture screenshot: ${chrome.runtime.lastError.message}`, tabId);
          return;
        }

        if (!dataUrl) {
          sendErrorMessage("Screenshot capture returned empty data", tabId);
          return;
        }

        // Send successful screenshot message
        const message: ScreenshotMessage = {
          type: BrowserMessageType.SCREENSHOT,
          data: dataUrl,
          tabId,
          timestamp: Date.now(),
          success: true
        };
        
        sendMessage(message);
        console.debug(`[Screenshot] Successfully captured screenshot for tab: ${tabId}`);
      }
    );
  } catch (error) {
    sendErrorMessage(`Exception capturing screenshot: ${error}`, tabId);
  }
}

/**
 * Send an error message for screenshot capture
 * @param errorMessage The error message
 * @param tabId Optional tab ID
 */
function sendErrorMessage(errorMessage: string, tabId?: number): void {
  console.error(`[Screenshot] ${errorMessage}`);
  
  const message: ScreenshotMessage = {
    type: BrowserMessageType.SCREENSHOT,
    data: "", // Empty data for error case
    tabId,
    timestamp: Date.now(),
    success: false,
    error: errorMessage
  };
  
  sendMessage(message);
} 