/**
 * Capture Screenshot Endpoint Types
 * 
 * These types define the request and response formats for the /capture-screenshot endpoint.
 * This endpoint captures a screenshot of the current browser tab.
 */

/**
 * POST /capture-screenshot
 * 
 * Request: No parameters required
 * Future enhancement could include options like dimensions, format, etc.
 */
export type CaptureScreenshotRequest = {};

/**
 * POST /capture-screenshot
 * 
 * Response: Screenshot data as base64 string
 */
export interface CaptureScreenshotResponse {
  /**
   * Base64 encoded screenshot data
   */
  data: string;
  
  /**
   * Content type of the screenshot (e.g., "image/png")
   */
  contentType: string;
  
  /**
   * Timestamp when the screenshot was captured
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
export interface CaptureScreenshotErrorResponse {
  /**
   * Error message
   */
  error: string;
  
  /**
   * Additional error details or user-friendly message
   */
  message?: string;
} 