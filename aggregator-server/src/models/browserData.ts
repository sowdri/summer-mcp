/**
 * Browser data model
 */
import { BrowserData } from "../types/index.js";

// Store data from browser extension
export const browserData: BrowserData = {
  consoleLogs: [],
  consoleErrors: [],
  networkRequests: {
    success: [],
    errors: [],
  },
  screenshot: null,
  selectedElement: null,
  browserTabs: [],
};

/**
 * Clear all logs and data
 */
export function clearAllLogs(): void {
  browserData.consoleLogs = [];
  browserData.consoleErrors = [];
  browserData.networkRequests.success = [];
  browserData.networkRequests.errors = [];
}

/**
 * Add console log
 */
export function addConsoleLog(log: any): void {
  browserData.consoleLogs.push(log);
}

/**
 * Add network request
 */
export function addNetworkRequest(request: any): void {
  if (request.method === "Network.loadingFailed") {
    browserData.networkRequests.errors.push(request);
  } else {
    browserData.networkRequests.success.push(request);
  }
}

/**
 * Set screenshot data
 */
export function setScreenshot(data: string): void {
  browserData.screenshot = data;
}

/**
 * Set selected element data
 */
export function setSelectedElement(data: any): void {
  browserData.selectedElement = data;
}

/**
 * Set browser tabs data
 */
export function setBrowserTabs(data: any[]): void {
  browserData.browserTabs = data;
}
