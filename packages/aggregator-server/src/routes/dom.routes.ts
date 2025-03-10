/**
 * DOM routes
 */
import { Router } from "express";
import {
  captureScreenshot,
  getSelectedElement,
} from "../controllers/dom.controller.js";

const router = Router();

// Capture screenshot
router.post("/capture-screenshot", captureScreenshot);

// Get selected element
router.get("/selected-element", getSelectedElement);

export default router;
