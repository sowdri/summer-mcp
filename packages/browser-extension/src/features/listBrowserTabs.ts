import { sendMessage } from "../websocket/messageSender";
import { 
  BrowserMessageType, 
  BrowserTabsMessage,
  BrowserTab,
  ListBrowserTabsCommand
} from "@summer-mcp/core";

/**
 * List all browser tabs with their IDs
 * Returns a list of all open tabs with their IDs, URLs, and titles
 * @param _command The ListBrowserTabsCommand object (unused)
 */
export function listBrowserTabs(_command: ListBrowserTabsCommand): void { // eslint-disable-line @typescript-eslint/no-unused-vars
  chrome.tabs.query({}, (tabs) => {
    const tabsList = tabs.map((tab) => ({
      id: tab.id || 0,
      url: tab.url || "",
      title: tab.title || "",
      active: tab.active,
      windowId: tab.windowId,
      index: tab.index,
      favIconUrl: tab.favIconUrl
    } as BrowserTab));

    const message: BrowserTabsMessage = {
      type: BrowserMessageType.BROWSER_TABS,
      data: tabsList,
      timestamp: Date.now()
    };

    sendMessage(message);
    console.debug("[Browser Tabs] Sent browser tabs list:", tabsList.length, "tabs");
  });
} 