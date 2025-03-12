/**
 * Image Processing Utilities
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { TakeScreenshotResponse } from "@summer-mcp/core";

// The current working directory
const __dirname = process.cwd();

/**
 * Resize an image using Sharp
 * @param imageBuffer The image buffer to resize
 * @param width The target width
 * @param height The target height
 * @returns A Promise that resolves to the resized image buffer
 */
export async function resizeImage(
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
 * Resize an image and return as base64 string
 * @param imageBuffer The image buffer to resize
 * @param width The target width
 * @param height The target height
 * @returns A Promise that resolves to the resized image as a base64 string
 */
export async function resizeImageToBase64(
  imageBuffer: Buffer,
  width: number,
  height?: number
): Promise<string> {
  const resizedBuffer = await resizeImage(imageBuffer, width, height);
  return resizedBuffer.toString("base64");
}

/**
 * Process screenshot data from a data URL
 * @param dataUrl The data URL containing the screenshot image
 * @returns A Promise that resolves to a TakeScreenshotResponse object
 */
export async function processScreenshot(
  dataUrl: string
): Promise<TakeScreenshotResponse> {
  if (!dataUrl) {
    throw new Error("Screenshot data is undefined or empty");
  }

  try {
    // Extract content type and base64 data from the data URL
    // Data URL format: data:[<mediatype>][;base64],<data>
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

    if (matches && matches.length === 3) {
      const contentType = matches[1];
      const base64Data = matches[2];

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Data, "base64");
      const timestamp = Date.now();
      let originalPath: string | undefined;
      let resizedPath: string | undefined;

      // Create screenshots directory
      const debugDir = path.join(__dirname, "../../debug-screenshots");

      // Create directory if it doesn't exist
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }

      // Save original image to file system
      originalPath = path.join(debugDir, `original-${timestamp}.png`);
      fs.writeFileSync(originalPath, imageBuffer);
      console.log(`Original screenshot saved to: ${originalPath}`);

      // Resize the image to max width 1200px while maintaining aspect ratio
      const resizedImageBuffer = await resizeImage(imageBuffer, 1200);
      
      // Save resized image
      resizedPath = path.join(debugDir, `resized-${timestamp}.png`);
      fs.writeFileSync(resizedPath, resizedImageBuffer);
      console.log(`🖼️ Resized screenshot saved to: ${resizedPath}`);

      // Log processing info
      console.log("Screenshot data processed with Sharp:", {
        originalSize: imageBuffer.length,
        resizedSize: resizedImageBuffer.length,
        contentType,
        timestamp,
        originalPath,
        resizedPath
      });

      // Return a properly typed response with the new format
      return {
        success: true,
        message: "Screenshot captured and saved successfully. The image will be pasted directly into the console.",
        screenshotPath: resizedPath,
        timestamp,
        contentType
      };
    } else {
      console.warn("Invalid data URL format:", dataUrl.substring(0, 50) + "...");
      // If the data URL format is invalid, return an error response
      throw new Error("Invalid data URL format");
    }
  } catch (error) {
    console.error("Error processing screenshot:", error);
    throw new Error(`Error processing screenshot: ${error}`);
  }
} 