/**
 * Type definitions for the aggregator server
 */

// Console log interface
export interface ConsoleLog {
  level?: string;
  type?: string;
  message?: string;
  [key: string]: any;
}

// Network request interface
export interface NetworkRequest {
  method: string;
  [key: string]: any;
}

// Browser data interface
export interface BrowserData {
  consoleLogs: ConsoleLog[];
  consoleErrors: ConsoleLog[];
  networkRequests: {
    success: NetworkRequest[];
    errors: NetworkRequest[];
  };
  screenshot: string | null;
  selectedElement: any | null;
  browserTabs: any[];
}
