/**
 * DOM routes
 */
import { Router } from "express";
import {
  captureScreenshot,
} from "../controllers/dom.controller";

const router: Router = Router();

// Capture screenshot
router.post("/capture-screenshot", captureScreenshot);

export default router;
