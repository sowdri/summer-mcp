/**
 * Network controller
 */
import { Request, Response } from "express";
import { browserData } from "../models/browserData.js";

/**
 * Get network errors
 */
export function getNetworkErrors(req: Request, res: Response): void {
  // Collect all network errors from all tabs
  const allErrors: any[] = [];

  // Iterate through all tabs and collect their network errors
  Object.values(browserData.tabs).forEach((tabData) => {
    if (tabData && tabData.networkRequests && tabData.networkRequests.errors) {
      allErrors.push(...tabData.networkRequests.errors);
    }
  });

  res.json(allErrors);
}

/**
 * Get successful network requests
 */
export function getNetworkSuccess(req: Request, res: Response): void {
  // Collect all successful network requests from all tabs
  const allSuccess: any[] = [];

  // Iterate through all tabs and collect their successful network requests
  Object.values(browserData.tabs).forEach((tabData) => {
    if (tabData && tabData.networkRequests && tabData.networkRequests.success) {
      allSuccess.push(...tabData.networkRequests.success);
    }
  });

  res.json(allSuccess);
}
