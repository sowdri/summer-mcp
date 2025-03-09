/**
 * Routes index
 */
import { Router } from "express";
import browserRoutes from "./browser.routes.js";
import consoleRoutes from "./console.routes.js";
import domRoutes from "./dom.routes.js";
import networkRoutes from "./network.routes.js";

const router = Router();

// Health check
router.get("/", (req, res) => {
  res.json({ message: "Spiller Aggregator Server is running" });
});

// Register all routes
router.use(consoleRoutes);
router.use(networkRoutes);
router.use(domRoutes);
router.use(browserRoutes);

export default router;
