import { sendMessage } from "../services/websocket/connection";

/**
 * Take a screenshot of the current tab
 * @param tabId The ID of the tab to take a screenshot of
 */
export function takeScreenshot(tabId: number): void {
  // Use the correct type for the first parameter (windowId)
  chrome.tabs.captureVisibleTab(
    chrome.windows.WINDOW_ID_CURRENT,
    { format: "png" },
    (dataUrl) => {
      // Send the original data URL to the server
      // The resizing will be done on the server side
      sendMessage("screenshot", dataUrl);
    }
  );
}
