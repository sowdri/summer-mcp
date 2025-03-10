/**
 * Active Tab Endpoint Types
 * 
 * These types define the request and response formats for the /active-tab endpoint.
 * This endpoint returns information about the currently active browser tab.
 */
import { BrowserTab } from '../BrowserMessage';

/**
 * GET /active-tab
 * 
 * Request: No parameters required
 */
export type GetActiveTabRequest = {};

/**
 * GET /active-tab
 * 
 * Response: Active browser tab information
 */
export interface GetActiveTabResponse extends BrowserTab {
  /**
   * Timestamp when the active tab was retrieved
   */
  timestamp?: number;
}

/**
 * Error response for active tab endpoint
 */
export interface GetActiveTabErrorResponse {
  /**
   * Error message
   */
  error: string;
  
  /**
   * Additional error details or user-friendly message
   */
  message?: string;
} 