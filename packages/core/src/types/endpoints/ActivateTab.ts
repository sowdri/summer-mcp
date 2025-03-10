/**
 * Activate Tab Endpoint Types
 * 
 * These types define the request and response formats for the /activate-tab endpoint.
 * This endpoint activates a specific browser tab.
 */

/**
 * POST /activate-tab
 * 
 * Request: Tab ID to activate
 */
export interface ActivateTabRequest {
  /**
   * ID of the tab to activate
   */
  tabId: number | string;
}

/**
 * POST /activate-tab
 * 
 * Response: Result of the tab activation
 */
export interface ActivateTabResponse {
  /**
   * Whether the tab was successfully activated
   */
  success: boolean;
  
  /**
   * ID of the tab that was activated
   */
  tabId?: number | string;
  
  /**
   * Timestamp when the tab was activated
   */
  timestamp?: number;
  
  /**
   * Error message if activation failed
   */
  error?: string;
}

/**
 * Error response for activate tab endpoint
 */
export interface ActivateTabErrorResponse {
  /**
   * Error message
   */
  error: string;
  
  /**
   * Additional error details or user-friendly message
   */
  message?: string;
} 