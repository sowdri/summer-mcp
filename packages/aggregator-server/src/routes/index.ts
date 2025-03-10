/**
 * Routes index
 */
import { Router } from "express";
import browserRoutes from "./browser.routes";
import consoleRoutes from "./console.routes";
import domRoutes from "./dom.routes";
import networkRoutes from "./network.routes";

const router: Router = Router();

// Health check
router.get("/", (req, res) => {
  res.json({ message: "Summer-MCP Aggregator Server is running" });
});

// Register all routes
router.use(consoleRoutes);
router.use(networkRoutes);
router.use(domRoutes);
router.use(browserRoutes);

export default router;
