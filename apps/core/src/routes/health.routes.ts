import express, { type Request, type Response } from "express";
const healthRouter = express.Router();

// GET /api/v1/health/live - Liveness probe (is the process running?)
healthRouter.get("/live", (req: Request, res: Response) => {
    res.json({ status: "alive" });
});

// GET /api/v1/health/ready - Readiness probe (is the service ready?)
healthRouter.get("/ready", async (req: Request, res: Response) => {
    // TODO: check DB connection, Redis connection
    res.json({ status: "ready", db: "healthy", redis: "healthy" });
});

export default healthRouter;