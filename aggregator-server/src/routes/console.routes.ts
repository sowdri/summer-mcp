/**
 * Console routes
 */
import { Router } from "express";
import {
  getConsoleErrors,
  getConsoleLogs,
  triggerConsoleLogCollection,
} from "../controllers/console.controller.js";

const router = Router();

// Get all console logs
router.get("/console-logs", getConsoleLogs);

// Get console errors
router.get("/console-errors", getConsoleErrors);

// Trigger console log collection from a specific tab
router.post("/trigger-console-logs", triggerConsoleLogCollection);

export default router;
