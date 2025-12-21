import express, { type Request, type Response } from "express";
const userRouter = express.Router();

// All routes require authentication (add auth middleware later)

// GET /api/v1/users/me - Get current user profile
userRouter.get("/me", (req: Request, res: Response) => {
    // TODO: require auth, return user data
    res.json({ user: {} });
});

// PATCH /api/v1/users/me - Update current user profile
userRouter.patch("/me", (req: Request, res: Response) => {
    // TODO: require auth, validate input, update user
    res.json({ user: {} });
});

// DELETE /api/v1/users/me - Delete own account
userRouter.delete("/me", (req: Request, res: Response) => {
    // TODO: require auth, soft delete user, revoke sessions
    res.json({ message: "Account deleted" });
});

// GET /api/v1/users/:id - Get user by ID (admin only)
userRouter.get("/:id", (req: Request, res: Response) => {
    // TODO: require auth + admin role
    res.json({ user: {} });
});

// PATCH /api/v1/users/:id/suspend - Suspend user (admin only)
userRouter.patch("/:id/suspend", (req: Request, res: Response) => {
    // TODO: require auth + admin role, suspend user, revoke sessions
    res.json({ message: "User suspended" });
});

export default userRouter;
