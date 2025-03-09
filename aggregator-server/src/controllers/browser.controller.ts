/**
 * Browser controller
 */
import { Request, Response } from "express";
import { browserData, clearAllLogs } from "../models/browserData.js";
import { sendCommandToExtension } from "../websocket/commands.js";

/**
 * Get browser tabs
 */
export function getBrowserTabs(req: Request, res: Response): void {
  // Send command to browser extension if we don't have tabs data
  if (browserData.browserTabs.length === 0) {
    sendCommandToExtension("listBrowserTabs");
  }

  res.json(browserData.browserTabs);
}

/**
 * Wipe all logs
 */
export function wipeLogs(req: Request, res: Response): void {
  clearAllLogs();
  res.json({ message: "All logs have been cleared" });
}
