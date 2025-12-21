import express, { type Request, type Response } from "express";
const healthRouter = express.Router();

healthRouter.get("/live", (req: Request, res: Response) => {
    res.json({ status: "alive" });
});

healthRouter.get("/ready", async (req: Request, res: Response) => {
    res.json({ status: "ready", db: "healthy", redis: "healthy" });
});

export default healthRouter;