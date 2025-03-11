import { sendMessage } from "../websocket/messageSender";
import { 
  BrowserMessageType, 
  ActiveTabMessage,
  BrowserTab,
  GetActiveBrowserTabCommand
} from "@summer-mcp/core";

/**
 * Get the active browser tab
 * Returns information about the currently active tab
 * @param _command The GetActiveBrowserTabCommand object (unused)
 */
export function getActiveBrowserTab(_command: GetActiveBrowserTabCommand): void { // eslint-disable-line @typescript-eslint/no-unused-vars
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("[Browser Tabs] No active tab found");
      return;
    }

    const activeTab = tabs[0];
    const tabInfo: BrowserTab = {
      id: activeTab.id || 0,
      url: activeTab.url || "",
      title: activeTab.title || "",
      active: true,
      windowId: activeTab.windowId,
      index: activeTab.index,
      favIconUrl: activeTab.favIconUrl
    };

    const message: ActiveTabMessage = {
      type: BrowserMessageType.ACTIVE_TAB,
      data: tabInfo,
      timestamp: Date.now()
    };

    sendMessage(message);
    console.debug("[Browser Tabs] Sent active tab info:", tabInfo.url);
  });
} 