/**
 * Browser data types for the MCP system
 */

import { BrowserTab, NetworkRequest } from "./messages";
import { TabData } from "./TabData";

// Browser data interface
export interface BrowserData {
  tabs: Record<string, TabData>;
}

// Configuration constants
export interface BrowserDataConfig {
  MAX_CONSOLE_LOGS: number; // All console logs including errors and warnings
  MAX_NETWORK_REQUESTS: number;
}

// Browser tabs response
export interface BrowserTabsResponse {
  tabs: BrowserTab[];
  timestamp: number;
} 