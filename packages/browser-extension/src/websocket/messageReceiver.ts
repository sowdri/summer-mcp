import { takeScreenshot } from "../features/screenshot";
import { activateBrowserTab, getActiveBrowserTab, listBrowserTabs } from "../features/tabs";
import { ServerCommand, ServerCommandType } from "@summer-mcp/core";

/**
 * Handle commands received from the server
 * @param command The command received from the server
 */
export function handleServerCommand(command: ServerCommand): void {
  // Debug log to track incoming commands
  console.log("Received server command:", command);

  // Handle commands that don't require an active tab
  if (command.command === ServerCommandType.LIST_BROWSER_TABS) {
    listBrowserTabs();
    return;
  }
  
  if (command.command === ServerCommandType.GET_ACTIVE_BROWSER_TAB) {
    getActiveBrowserTab();
    return;
  }
  
  if (command.command === ServerCommandType.ACTIVATE_BROWSER_TAB && command.params?.tabId) {
    activateBrowserTab(command.params.tabId);
    return;
  }

  // Handle commands that require an active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) {
      console.error("No active tab found");
      return;
    }

    const tabId = tabs[0].id;

    switch (command.command) {
      case ServerCommandType.TAKE_SCREENSHOT:
        takeScreenshot(tabId);
        break;
      default:
        console.log("Unknown command:", command.command);
    }
  });
}

/**
 * Process a message received from the server
 * @param data The raw message data received from the server
 */
export function processServerMessage(data: string): void {
  try {
    const message = JSON.parse(data);
    
    // Check if the message is a command
    if (message.type === 'command') {
      handleServerCommand(message as ServerCommand);
    } else if (message.type === 'connection') {
      console.log("Connection status:", message.status);
    } else {
      console.warn("Unknown message type:", message.type);
    }
  } catch (error) {
    console.error("Error processing server message:", error);
  }
} 