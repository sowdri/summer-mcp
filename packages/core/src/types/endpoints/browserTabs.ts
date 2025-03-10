/**
 * Browser Tabs Endpoint Types
 * 
 * These types define the request and response formats for the /browser-tabs endpoint.
 * This endpoint returns a list of all browser tabs.
 */
import { BrowserTab } from '../BrowserMessage';

/**
 * GET /browser-tabs
 * 
 * Request: No parameters required
 */
export interface GetBrowserTabsRequest {
  // No parameters required for this endpoint
}

/**
 * GET /browser-tabs
 * 
 * Response: List of browser tabs with timestamp
 */
export interface GetBrowserTabsResponse {
  /**
   * List of browser tabs
   */
  tabs: BrowserTab[];
  
  /**
   * Timestamp when the tabs were retrieved
   */
  timestamp: number;
  
  /**
   * Error message if any
   */
  error?: string;
}

/**
 * Error response for browser tabs endpoint
 */
export interface GetBrowserTabsErrorResponse {
  /**
   * Error message
   */
  error: string;
  
  /**
   * Additional error details or user-friendly message
   */
  message?: string;
} 