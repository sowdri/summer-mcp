/**
 * Network Requests API Types
 * 
 * These types define the request and response formats for the /network-requests endpoint.
 * This endpoint gets network requests for a specific browser tab.
 */
import { NetworkRequest } from "./BrowserMessage";

/**
 * GET /network-requests
 * 
 * Request: Tab ID is required, limit is optional
 */
export interface GetNetworkRequestsParams {
  /**
   * ID of the tab to get network requests from
   */
  tabId: string;
  
  /**
   * Maximum number of requests to return
   */
  limit?: number;
}

/**
 * GET /network-requests
 * 
 * Response: Network requests data
 */
export interface GetNetworkRequestsResponse {
  /**
   * Number of network requests returned
   */
  count: number;
  
  /**
   * ID of the tab the requests are from
   */
  tabId: string;
  
  /**
   * Array of network requests
   */
  requests: NetworkRequest[];
  
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
 * Error response for network requests endpoint
 */
export interface GetNetworkRequestsErrorResponse {
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