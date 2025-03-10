/**
 * Take Screenshot Endpoint Types
 * 
 * These types define the request and response formats for the /take-screenshot endpoint.
 * This endpoint takes a screenshot of the current browser tab.
 */

/**
 * POST /take-screenshot
 * 
 * Request: No parameters required
 * Future enhancement could include options like dimensions, format, etc.
 */
export type TakeScreenshotRequest = {};

/**
 * POST /take-screenshot
 * 
 * Response: Screenshot data as base64 string
 */
export interface TakeScreenshotResponse {
  /**
   * Base64 encoded screenshot data
   */
  data: string;
  
  /**
   * Content type of the screenshot (e.g., "image/png")
   */
  contentType: string;
  
  /**
   * Timestamp when the screenshot was taken
   */
  timestamp: number;
  
  /**
   * Original size of the screenshot in bytes (before resizing)
   */
  originalSize?: number;
  
  /**
   * Resized size of the screenshot in bytes
   */
  resizedSize?: number;
}

/**
 * Error response for screenshot endpoint
 */
export interface TakeScreenshotErrorResponse {
  /**
   * Error message
   */
  error: string;
  
  /**
   * Additional error details or user-friendly message
   */
  message?: string;
} 