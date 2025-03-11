/**
 * Console Logs API Types
 * 
 * These types define the request and response formats for the /console-logs and /console-errors endpoints.
 * These endpoints get console logs for a specific browser tab.
 */
import { ConsoleLog } from "./TabData";

/**
 * GET /console-logs or /console-errors
 * 
 * Request: Tab ID is required, limit is optional
 */
export interface GetConsoleLogsParams {
  /**
   * ID of the tab to get console logs from
   */
  tabId: string;
  
  /**
   * Maximum number of logs to return
   */
  limit?: number;
}

/**
 * GET /console-logs or /console-errors
 * 
 * Response: Console logs data
 */
export interface GetConsoleLogsResponse {
  /**
   * Number of console logs returned
   */
  count: number;
  
  /**
   * ID of the tab the logs are from
   */
  tabId: string;
  
  /**
   * Array of console logs
   */
  logs: ConsoleLog[];
  
  /**
   * Whether the operation was successful
   */
  success: boolean;
  
  /**
   * Timestamp when the response was generated
   */
  timestamp?: number;
}

/**
 * Error response for console logs endpoints
 */
export interface GetConsoleLogsErrorResponse {
  /**
   * Error message
   */
  error: string;
  
  /**
   * Additional error details or user-friendly message
   */
  message?: string;
  
  /**
   * Whether the operation was successful (always false for error responses)
   */
  success: false;
} 