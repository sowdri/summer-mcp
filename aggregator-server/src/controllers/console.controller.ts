/**
 * Console controller
 */
import { Request, Response } from "express";
import { browserData } from "../models/browserData.js";

/**
 * Get all console logs
 */
export function getConsoleLogs(req: Request, res: Response): void {
  res.json(browserData.consoleLogs);
}

/**
 * Get console errors
 */
export function getConsoleErrors(req: Request, res: Response): void {
  const errors = browserData.consoleLogs.filter(
    (log) => log.level === "error" || log.type === "error"
  );
  res.json(errors);
}
