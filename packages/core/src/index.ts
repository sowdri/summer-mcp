/**
 * Core types and utilities for Summer MCP
 */

// Export all types from server messages
export * from './types/ServerMessage';

// Export all types from browser messages
export * from './types/BrowserMessage';

// Export browser data types
export * from './types/BrowserData';
export * from './types/TabData';
export * from './types/BrowserDataProvider';

// Export endpoint types
export * from './types/endpoints/GetBrowserTabs';
export * from './types/endpoints/GetActiveTab';
export * from './types/endpoints/ActivateTab';
// Re-export the updated TakeScreenshot types
export { 
  TakeScreenshotRequest, 
  TakeScreenshotResponse, 
  TakeScreenshotErrorResponse 
} from './types/endpoints/TakeScreenshot';
export * from './types/endpoints/GetDomSnapshot';

// Export utility functions
export * from './utils/type-guards';

// Export network request types
export * from './types/NetworkRequests';

// Export console logs types
export * from './types/ConsoleLogs'; 