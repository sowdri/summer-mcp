/**
 * Browser controller
 */
import { Request, Response } from "express";
import { clearAllLogs } from "../models/browserData.js";
import { registerTabsRequest } from "../services/browserTabs.service.js";
import { sendCommandToExtension } from "../websocket/commands.js";

/**
 * Get browser tabs
 */
export function getBrowserTabs(req: Request, res: Response): void {
  // Register the request with the browser tabs service
  registerTabsRequest(res);

  // Send command to browser extension
  sendCommandToExtension("listBrowserTabs");
}

/**
 * Wipe all logs
 */
export function wipeLogs(req: Request, res: Response): void {
  clearAllLogs();
  res.json({ message: "All logs have been cleared" });
}
