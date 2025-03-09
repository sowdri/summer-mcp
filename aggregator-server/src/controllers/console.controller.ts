/**
 * Console controller
 */
import { Request, Response } from "express";
import { browserData } from "../models/browserData.js";
import { clients, sendCommandToExtension } from "../websocket/commands.js";

/**
 * Get all console logs
 */
export function getConsoleLogs(req: Request, res: Response): void {
  // Check if a specific tab ID is requested
  const tabId = req.query.tabId as string;

  if (tabId) {
    // Return logs for the specific tab
    const tabData = browserData.tabs[tabId];
    if (tabData) {
      res.json(tabData.consoleLogs);
    } else {
      res.json([]);
    }
  } else {
    // Return logs from the default tab for backward compatibility
    const defaultTabId = "default";
    const defaultTabData = browserData.tabs[defaultTabId];
    res.json(defaultTabData?.consoleLogs || []);
  }
}

/**
 * Get console errors
 */
export function getConsoleErrors(req: Request, res: Response): void {
  // Check if a specific tab ID is requested
  const tabId = req.query.tabId as string;

  if (tabId) {
    // Return errors for the specific tab
    const tabData = browserData.tabs[tabId];
    if (tabData) {
      const errors = tabData.consoleLogs.filter(
        (log) => log.level === "error" || log.type === "error"
      );
      res.json(errors);
    } else {
      res.json([]);
    }
  } else {
    // Return errors from the default tab for backward compatibility
    const defaultTabId = "default";
    const defaultTabData = browserData.tabs[defaultTabId];

    if (defaultTabData) {
      const errors = defaultTabData.consoleLogs.filter(
        (log) => log.level === "error" || log.type === "error"
      );
      res.json(errors);
    } else {
      res.json([]);
    }
  }
}

/**
 * Trigger console log collection from a specific tab
 */
export function triggerConsoleLogCollection(
  req: Request,
  res: Response
): Response | void {
  // Check if there are any connected WebSocket clients
  if (clients.size === 0) {
    // No browser extensions connected, return an error
    return res.status(503).json({
      error: "No browser extension connected",
      message: "Please ensure the browser extension is installed and connected",
    });
  }

  // Get tabId from request parameters or query
  const tabId = req.params.tabId || req.query.tabId;

  if (!tabId) {
    return res.status(400).json({
      error: "Missing tabId parameter",
      message:
        "Please provide a tabId parameter to collect console logs from a specific tab",
    });
  }

  // Send command to browser extension
  const commandSent = sendCommandToExtension("getConsoleLogs", { tabId });

  // If command wasn't sent successfully, return error
  if (!commandSent) {
    return res.status(503).json({
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    });
  }

  // Return success response
  res.json({
    message: "Console log collection triggered",
    tabId: tabId,
  });
}
