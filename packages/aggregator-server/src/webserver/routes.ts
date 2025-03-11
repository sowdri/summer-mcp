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

const router: Router = Router();

// Health check
router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Summer-MCP Aggregator Server is running" });
});

// Browser routes
router.get("/browser-tabs", getBrowserTabs);
router.get("/active-tab", getActiveBrowserTab);
router.post("/activate-tab", activateBrowserTab);

// DOM routes
router.post("/take-screenshot", takeScreenshot);
router.post("/dom-snapshot", getDomSnapshot);

// Network routes
// TODO: Implement network routes

// Console routes
// No console routes needed as logs are streamed continuously

export default router; 