/**
 * DOM controller
 */
import { Request, Response } from "express";
import { browserData } from "../models/browserData.js";
import { registerScreenshotRequest } from "../services/screenshot.service.js";
import { sendCommandToExtension } from "../websocket/commands.js";

/**
 * Capture screenshot
 */
export function captureScreenshot(req: Request, res: Response): void {
  // Register the request with the screenshot service
  registerScreenshotRequest(res);

  // Send command to browser extension
  sendCommandToExtension("takeScreenshot");
}

/**
 * Get selected element
 */
export function getSelectedElement(req: Request, res: Response): void {
  // Get the selected element from the default tab
  const defaultTabId = "default";
  const selectedElement = browserData.tabs[defaultTabId]?.selectedElement;

  if (selectedElement) {
    res.json(selectedElement);
  } else {
    res.status(404).json({ error: "No element currently selected" });
  }
}
