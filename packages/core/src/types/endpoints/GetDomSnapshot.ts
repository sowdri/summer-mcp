/**
 * Get DOM Snapshot Endpoint Types
 * 
 * These types define the request and response formats for the /dom-snapshot endpoint.
 * This endpoint gets a DOM snapshot of a specific browser tab.
 */

/**
 * POST /dom-snapshot
 * 
 * Request: Tab ID is required
 */
export interface GetDomSnapshotRequest {
  /**
   * ID of the tab to get DOM snapshot from
   */
  tabId: string;
}

/**
 * POST /dom-snapshot
 * 
 * Response: DOM snapshot data
 */
export interface GetDomSnapshotResponse {
  /**
   * HTML content of the DOM snapshot
   */
  html: string;
  
  /**
   * Whether the operation was successful
   */
  success: boolean;
  
  /**
   * Timestamp when the DOM snapshot was taken
   */
  timestamp?: number;
}

/**
 * Error response for DOM snapshot endpoint
 */
export interface GetDomSnapshotErrorResponse {
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