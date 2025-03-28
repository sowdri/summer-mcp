/**
 * Types for commands sent from the server to the browser extension
 */

/**
 * All possible command types that can be sent from the server to the browser
 */
export enum ServerCommandType {
  LIST_BROWSER_TABS = "listBrowserTabs",
  GET_ACTIVE_BROWSER_TAB = "getActiveBrowserTab",
  ACTIVATE_BROWSER_TAB = "activateBrowserTab",
  TAKE_SCREENSHOT = "takeScreenshot",
  GET_DOM_SNAPSHOT = "getDomSnapshot"
}

/**
 * Base interface for all server commands
 */
export interface BaseServerCommand {
  type: 'command';
  command: ServerCommandType;
}

/**
 * Command to list all browser tabs
 */
export interface ListBrowserTabsCommand extends BaseServerCommand {
  command: ServerCommandType.LIST_BROWSER_TABS;
}

/**
 * Command to get the active browser tab
 */
export interface GetActiveBrowserTabCommand extends BaseServerCommand {
  command: ServerCommandType.GET_ACTIVE_BROWSER_TAB;
}

/**
 * Command to activate a specific browser tab
 */
export interface ActivateBrowserTabCommand extends BaseServerCommand {
  command: ServerCommandType.ACTIVATE_BROWSER_TAB;
  params: {
    tabId: string;
  };
}

/**
 * Command to take a screenshot of the current tab or a specific tab
 */
export interface TakeScreenshotCommand extends BaseServerCommand {
  command: ServerCommandType.TAKE_SCREENSHOT;
  params?: {
    tabId?: string;
  };
}

/**
 * Command to get a DOM snapshot of a specific tab
 */
export interface GetDomSnapshotCommand extends BaseServerCommand {
  command: ServerCommandType.GET_DOM_SNAPSHOT;
  params: {
    tabId: string;
  };
}

/**
 * Connection status message sent from server to browser
 */
export interface ConnectionStatusCommand {
  type: 'connection';
  status: 'connected' | 'disconnected' | 'error';
  message?: string;
}

/**
 * Union type of all possible server commands
 */
export type ServerCommand =
  | ListBrowserTabsCommand
  | GetActiveBrowserTabCommand
  | ActivateBrowserTabCommand
  | TakeScreenshotCommand
  | GetDomSnapshotCommand;

/**
 * Union type of all possible server messages (commands + connection status)
 */
export type ServerMessage = ServerCommand | ConnectionStatusCommand; 