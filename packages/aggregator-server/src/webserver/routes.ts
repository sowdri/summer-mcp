/**
 * Consolidated Routes
 * All API routes for the aggregator server
 */
import { Router, Request, Response } from "express";
import { getBrowserTabs } from "./handlers/getBrowserTabs";
import { getActiveBrowserTab } from "./handlers/getActiveBrowserTab";
import { activateBrowserTab } from "./handlers/activateBrowserTab";
import { takeScreenshot } from "./handlers/takeScreenshot";
import { getDomSnapshot } from "./handlers/getDomSnapshot";
import { getNetworkRequests } from "./handlers/getNetworkRequests";
import { getNetworkErrors } from "./handlers/getNetworkErrors";

const router: Router = Router();

// Health check
router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Summer-MCP Aggregator Server is running" });
});

// Browser tab routes
router.get("/tabs", getBrowserTabs);
router.get("/active-tab", getActiveBrowserTab);
router.post("/activate-tab", activateBrowserTab);

// DOM routes
router.get("/dom-snapshot", getDomSnapshot);
router.post("/take-screenshot", takeScreenshot);

// Network routes
router.get("/network-requests", getNetworkRequests);
router.get("/network-errors", getNetworkErrors);

// Console routes
// No console routes needed as logs are streamed continuously

export default router; 