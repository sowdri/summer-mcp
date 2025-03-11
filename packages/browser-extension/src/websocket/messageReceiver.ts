import { takeScreenshot } from "../features/takeScreenshot";
import { activateBrowserTab } from "../features/activateBrowserTab";
import { getActiveBrowserTab } from "../features/getActiveBrowserTab";
import { listBrowserTabs } from "../features/listBrowserTabs";
import { 
  ServerCommand, 
  ServerCommandType, 
  ServerMessage,
  ActivateBrowserTabCommand,
  TakeScreenshotCommand,
  ListBrowserTabsCommand,
  GetActiveBrowserTabCommand
} from "@summer-mcp/core";

/**
 * Handle commands received from the server
 * @param command The command received from the server
 */
export function handleServerCommand(command: ServerCommand): void {
  console.log("Received server command:", command.command);

  switch (command.command) {
    case ServerCommandType.LIST_BROWSER_TABS:
      listBrowserTabs(command as ListBrowserTabsCommand);
      break;
      
    case ServerCommandType.GET_ACTIVE_BROWSER_TAB:
      getActiveBrowserTab(command as GetActiveBrowserTabCommand);
      break;
      
    case ServerCommandType.ACTIVATE_BROWSER_TAB:
      activateBrowserTab(command as ActivateBrowserTabCommand);
      break;
      
    case ServerCommandType.TAKE_SCREENSHOT:
      takeScreenshot(command as TakeScreenshotCommand);
      break;
      
    default:
      // This should never happen as we've covered all command types in the enum
      console.warn("Unknown command type received");
      break;
  }
}

/**
 * Process a message received from the server
 * @param data The raw message data received from the server
 */
export function processServerMessage(data: string): void {
  try {
    const message = JSON.parse(data) as ServerMessage;
    
    if (message.type === 'command') {
      handleServerCommand(message as ServerCommand);
    } else if (message.type === 'connection') {
      console.log(`Connection status: ${message.status}`, message.message || '');
    } else {
      console.warn(`Unknown message type: ${(message as any).type}`);
    }
  } catch (error) {
    console.error("Error processing server message:", error);
  }
} 