/**
 * Console routes
 */
import { Router } from "express";
import {
  getConsoleErrors,
  getConsoleLogs,
} from "../controllers/console.controller.js";

const router = Router();

// Get all console logs
router.get("/console-logs", getConsoleLogs);

// Get console errors
router.get("/console-errors", getConsoleErrors);

export default router;
