import express, { type Request, type Response } from "express";
const sessionRouter = express.Router();

// All routes require authentication

// GET /api/v1/sessions - List all active sessions for current user
sessionRouter.get("/", (req: Request, res: Response) => {
    // TODO: require auth, return list of sessions with device info
    res.json({ sessions: [] });
});

// DELETE /api/v1/sessions/:id - Revoke a specific session
sessionRouter.delete("/:id", (req: Request, res: Response) => {
    // TODO: require auth, verify session belongs to user, revoke it
    res.json({ message: "Session revoked" });
});

// DELETE /api/v1/sessions - Revoke all sessions except current
sessionRouter.delete("/", (req: Request, res: Response) => {
    // TODO: require auth, revoke all other sessions
    res.json({ message: "All other sessions revoked" });
});

export default sessionRouter;