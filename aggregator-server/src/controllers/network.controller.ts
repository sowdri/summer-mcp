/**
 * Network controller
 */
import { Request, Response } from "express";
import { browserData } from "../models/browserData.js";

/**
 * Get network errors
 */
export function getNetworkErrors(req: Request, res: Response): void {
  res.json(browserData.networkRequests.errors);
}

/**
 * Get successful network requests
 */
export function getNetworkSuccess(req: Request, res: Response): void {
  res.json(browserData.networkRequests.success);
}
