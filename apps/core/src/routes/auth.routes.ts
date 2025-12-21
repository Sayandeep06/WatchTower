import express, { type Request, type Response } from "express";
const authRouter = express.Router();


authRouter.post("/register", (req: Request, res: Response) => {
    // TODO: validate input, hash password, create user, send verification email
    res.status(201).json({ message: "User registered" });
});

// POST /api/v1/auth/login - Authenticate user, return tokens
authRouter.post("/login", (req: Request, res: Response) => {
    // TODO: validate credentials, create session, generate tokens
    res.json({ accessToken: "...", user: {} });
});

// POST /api/v1/auth/logout - Revoke current session
authRouter.post("/logout", (req: Request, res: Response) => {
    // TODO: require auth, revoke session, clear cookie
    res.json({ message: "Logged out" });
});

// POST /api/v1/auth/refresh - Get new access token using refresh token
authRouter.post("/refresh", (req: Request, res: Response) => {
    // TODO: validate refresh token from cookie, rotate tokens
    res.json({ accessToken: "..." });
});

// POST /api/v1/auth/forgot-password - Request password reset email
authRouter.post("/forgot-password", (req: Request, res: Response) => {
    // TODO: generate reset token, send email
    res.json({ message: "If email exists, reset link sent" });
});

// POST /api/v1/auth/reset-password - Reset password with token
authRouter.post("/reset-password", (req: Request, res: Response) => {
    // TODO: validate token, update password, revoke all sessions
    res.json({ message: "Password reset successful" });
});

// POST /api/v1/auth/verify-email - Verify email with token
authRouter.post("/verify-email", (req: Request, res: Response) => {
    // TODO: validate token, mark email as verified
    res.json({ message: "Email verified" });
});

export default authRouter;