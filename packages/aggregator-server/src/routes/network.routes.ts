/**
 * Network routes
 */
import { Router } from "express";
import {
  getNetworkErrors,
  getNetworkSuccess,
} from "../controllers/network.controller.js";

const router = Router();

// Get network errors
router.get("/network-errors", getNetworkErrors);

// Get successful network requests
router.get("/network-success", getNetworkSuccess);

export default router;
