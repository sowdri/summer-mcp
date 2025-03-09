import { sendMessage } from "../services/websocket/connection";

/**
 * List all browser tabs with their IDs
 * Returns a list of all open tabs with their IDs, URLs, and titles
 */
export function listBrowserTabs(): void {
  chrome.tabs.query({}, (tabs) => {
    const tabsList = tabs.map((tab) => ({
      id: tab.id,
      url: tab.url,
      title: tab.title,
      active: tab.active,
      windowId: tab.windowId,
      index: tab.index,
    }));

    sendMessage("browser-tabs", tabsList);
    console.log("Sent browser tabs list:", tabsList.length, "tabs");
  });
}
