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
 * Response: Success status and path to the saved screenshot
 */
export interface TakeScreenshotResponse {
  /**
   * Whether the screenshot was successfully taken and saved
   */
  success: boolean;
  
  /**
   * User-friendly message about the screenshot operation
   */
  message: string;
  
  /**
   * File system path where the screenshot is stored
   */
  screenshotPath: string;
  
  /**
   * Timestamp when the screenshot was taken
   */
  timestamp: number;
  
  /**
   * Content type of the screenshot (e.g., "image/png")
   */
  contentType?: string;
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