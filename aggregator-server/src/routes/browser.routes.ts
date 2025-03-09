/**
 * Browser routes
 */
import { Router } from "express";
import { getBrowserTabs, wipeLogs } from "../controllers/browser.controller.js";

const router = Router();

// Get browser tabs
router.get("/browser-tabs", getBrowserTabs);

// Wipe logs
router.post("/wipelogs", wipeLogs);

export default router;
