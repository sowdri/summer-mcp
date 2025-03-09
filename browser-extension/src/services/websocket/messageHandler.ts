import { startConsoleMonitoring } from "../../features/console";
import { getDomSnapshot } from "../../features/dom";
import { startNetworkMonitoring } from "../../features/network";
import { takeScreenshot } from "../../features/screenshot";
import { ServerCommand } from "../../types/interfaces";

/**
 * Handle commands received from the server
 * @param message The message received from the server
 */
export function handleServerCommand(message: ServerCommand): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) {
      console.error("No active tab found");
      return;
    }

    const tabId = tabs[0].id;

    switch (message.command) {
      case "takeScreenshot":
        takeScreenshot(tabId);
        break;
      case "getConsoleLogs":
        startConsoleMonitoring(tabId);
        break;
      case "getNetworkRequests":
        startNetworkMonitoring(tabId);
        break;
      case "getDomSnapshot":
        getDomSnapshot(tabId);
        break;
      default:
        console.log("Unknown command:", message.command);
    }
  });
}
