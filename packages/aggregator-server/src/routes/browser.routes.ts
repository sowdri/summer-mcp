/**
 * Browser routes
 */
import { Router } from "express";
import { 
  getBrowserTabs, 
  getActiveBrowserTab, 
  activateBrowserTab
} from "../controllers/browser.controller";

const router: Router = Router();

// Get browser tabs
router.get("/browser-tabs", getBrowserTabs);

// Get active browser tab
router.get("/active-tab", getActiveBrowserTab);

// Activate browser tab
router.post("/activate-tab", activateBrowserTab);

export default router;
