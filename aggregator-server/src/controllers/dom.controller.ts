/**
 * DOM controller
 */
import { Request, Response } from "express";
import { browserData } from "../models/browserData.js";
import { sendCommandToExtension } from "../websocket/commands.js";

/**
 * Capture screenshot
 */
export function captureScreenshot(req: Request, res: Response): void {
  // Send command to browser extension
  sendCommandToExtension("takeScreenshot");

  // Return the most recent screenshot or an error if none available
  if (browserData.screenshot) {
    res.json({ success: true, data: browserData.screenshot });
  } else {
    res.status(404).json({
      success: false,
      error: "No screenshot available. Please try again in a moment.",
    });
  }
}

/**
 * Get selected element
 */
export function getSelectedElement(req: Request, res: Response): void {
  if (browserData.selectedElement) {
    res.json(browserData.selectedElement);
  } else {
    res.status(404).json({ error: "No element currently selected" });
  }
}
