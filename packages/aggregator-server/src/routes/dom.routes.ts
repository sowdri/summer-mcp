/**
 * DOM routes
 */
import { Router } from "express";
import {
  captureScreenshot,
} from "../controllers/dom.controller.js";

const router: Router = Router();

// Capture screenshot
router.post("/capture-screenshot", captureScreenshot);

export default router;
