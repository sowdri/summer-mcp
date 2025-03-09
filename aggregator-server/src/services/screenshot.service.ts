/**
 * Screenshot Service
 * Handles communication between HTTP requests and WebSocket responses
 */
import { Response } from "express";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Get the directory name in a way that works with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface for pending request entry
interface PendingScreenshotRequest {
  res: Response;
  timeout: NodeJS.Timeout;
}

// Store pending requests with their response objects
export const pendingScreenshotRequests = new Map<
  string,
  PendingScreenshotRequest
>();

/**
 * Register a new screenshot request
 * @param res Express response object
 * @param timeoutMs Timeout in milliseconds
 * @returns Request ID
 */
export function registerScreenshotRequest(
  res: Response,
  timeoutMs = 5000
): string {
  // Generate a unique request ID
  const requestId = Date.now().toString();

  // Set a timeout to handle the case when no response is received
  const timeout = setTimeout(() => {
    // If the request is still pending when timeout occurs
    if (pendingScreenshotRequests.has(requestId)) {
      pendingScreenshotRequests.delete(requestId);
      res.status(504).json({ error: "Timeout waiting for screenshot data" });
    }
  }, timeoutMs);

  // Store the response object and timeout
  pendingScreenshotRequests.set(requestId, { res, timeout });

  return requestId;
}

/**
 * Resize an image using Sharp
 * @param imageBuffer The image buffer to resize
 * @param width The target width
 * @param height The target height
 * @returns A Promise that resolves to the resized image buffer
 */
async function resizeImage(
  imageBuffer: Buffer,
  width: number,
  height?: number
): Promise<Buffer> {
  try {
    const resizeOptions: sharp.ResizeOptions = { width };
    if (height) {
      resizeOptions.height = height;
    }
    return await sharp(imageBuffer).resize(resizeOptions).png().toBuffer();
  } catch (error) {
    console.error("Error resizing image with Sharp:", error);
    throw error;
  }
}

/**
 * Handle screenshot response from websocket
 * @param data Screenshot data URL from Chrome API (data:image/png;base64,...)
 */
export async function handleScreenshotResponse(data: string): Promise<void> {
  // Check if there are any pending requests
  if (pendingScreenshotRequests.size === 0) {
    console.warn("Received screenshot data but no pending requests found");
    return;
  }

  // Resolve all pending requests as they all need the same data
  for (const [
    requestId,
    { res, timeout },
  ] of pendingScreenshotRequests.entries()) {
    // Clear the timeout
    clearTimeout(timeout);

    // Check if data is defined and not empty
    if (!data) {
      console.error("Screenshot data is undefined or empty");
      res.status(500).json({ error: "Screenshot data is undefined or empty" });
      pendingScreenshotRequests.delete(requestId);
      continue;
    }

    try {
      // Extract content type and base64 data from the data URL
      // Data URL format: data:[<mediatype>][;base64],<data>
      const matches = data.match(/^data:([^;]+);base64,(.+)$/);

      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const base64Data = matches[2];

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Save original image to file system for debugging
        const debugDir = path.join(__dirname, "../../debug-screenshots");

        // Create directory if it doesn't exist
        if (!fs.existsSync(debugDir)) {
          fs.mkdirSync(debugDir, { recursive: true });
        }

        const timestamp = Date.now();
        const originalFilePath = path.join(
          debugDir,
          `original-${timestamp}.png`
        );
        fs.writeFileSync(originalFilePath, imageBuffer);
        console.log(`Original screenshot saved to: ${originalFilePath}`);

        // Resize the image to max width 500px while maintaining aspect ratio
        const resizedImageBuffer = await resizeImage(imageBuffer, 500);

        // Save resized image to file system for debugging
        const resizedFilePath = path.join(debugDir, `resized-${timestamp}.png`);
        fs.writeFileSync(resizedFilePath, resizedImageBuffer);
        console.log(`Resized screenshot saved to: ${resizedFilePath}`);

        // Convert back to base64
        const resizedBase64Data = resizedImageBuffer.toString("base64");

        console.log("Screenshot data processed with Sharp:", {
          originalSize: imageBuffer.length,
          resizedSize: resizedImageBuffer.length,
          contentType: contentType,
          timestamp: timestamp,
          originalPath: originalFilePath,
          resizedPath: resizedFilePath,
        });

        // Send the response with content type information
        res.json({
          data: resizedBase64Data,
          contentType: contentType,
          timestamp: timestamp,
        });
      } else {
        console.warn("Invalid data URL format:", data.substring(0, 50) + "...");
        // If the data URL format is invalid, send the original data
        res.json({
          data: data,
          contentType: "image/png", // Default to PNG
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error processing screenshot data:", error);
      res.status(500).json({ error: "Error processing screenshot data" });
    }

    // Remove from pending requests
    pendingScreenshotRequests.delete(requestId);
  }
}
