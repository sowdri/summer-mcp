/**
 * Browser routes
 */
import { Router } from "express";
import { 
  getBrowserTabs, 
  getActiveBrowserTab, 
  activateBrowserTab, 
  wipeLogs 
} from "../controllers/browser.controller.js";

const router = Router();

// Get browser tabs
router.get("/browser-tabs", getBrowserTabs);

// Get active browser tab
router.get("/active-tab", getActiveBrowserTab);

// Activate browser tab
router.post("/activate-tab", activateBrowserTab);

// Wipe logs
router.post("/wipe-logs", wipeLogs);

export default router;
