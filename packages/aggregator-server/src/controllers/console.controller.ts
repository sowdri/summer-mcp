/**
 * Console controller
 */
import { Request, Response } from "express";
import { browserData } from "../models/browserData.js";
import { clients, sendCommandToExtension } from "../websocket/commands.js";
import { ServerCommandType, GetConsoleLogsCommand } from "@summer-mcp/core";

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
      res.status(404).json({
        error: "Tab not found",
        message: `No data found for tab ID: ${tabId}`,
      });
    }
  } else {
    // Return logs for all tabs
    const allLogs: Record<string, any> = {};
    Object.keys(browserData.tabs).forEach((id) => {
      allLogs[id] = browserData.tabs[id].consoleLogs;
    });
    res.json(allLogs);
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
      // Filter console logs to only include errors
      const errors = tabData.consoleLogs.filter(
        (log) => log.level === "error" || log.type === "error"
      );
      res.json(errors);
    } else {
      res.status(404).json({
        error: "Tab not found",
        message: `No data found for tab ID: ${tabId}`,
      });
    }
  } else {
    // Return errors for all tabs
    const allErrors: Record<string, any> = {};
    Object.keys(browserData.tabs).forEach((id) => {
      allErrors[id] = browserData.tabs[id].consoleLogs.filter(
        (log) => log.level === "error" || log.type === "error"
      );
    });
    res.json(allErrors);
  }
}

/**
 * Trigger console log collection from browser
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

  // Create the command object
  const command: GetConsoleLogsCommand = {
    type: 'command',
    command: ServerCommandType.GET_CONSOLE_LOGS
  };

  // Send command to browser extension
  const commandSent = sendCommandToExtension(command);

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
