import express, { type Request, type Response } from "express";
import { registerSchema, authSchema, forgotPasswordSchema } from "../schemas/auth.schema";
import {AuthService} from "../services/auth.service";
const authRouter = express.Router();
const authService = AuthService.getInstance();

authRouter.post("/register", async (req: Request, res: Response) => {
    const isValid = registerSchema.safeParse(req.body);
    if (!isValid.success) {
        return res.status(400).json({ error: isValid.error.message });
    }
    const userId = await authService.register(isValid.data);
    res.status(201).json({ message: "User registered" });
});

authRouter.post("/login", async (req: Request, res: Response) => {
    const isValid = authSchema.safeParse(req.body);
    if (!isValid.success) { 
        return res.status(400).json({ error: isValid.error.message });
    }
    const userId = await authService.login(isValid.data);
    res.json({ accessToken: "...", user: {} });
});


authRouter.post("/logout", (req: Request, res: Response) => {

    res.json({ message: "Logged out" });
});


authRouter.post("/refresh", (req: Request, res: Response) => {

    res.json({ accessToken: "..." });
});


authRouter.post("/forgot-password", (req: Request, res: Response) => {

    res.json({ message: "If email exists, reset link sent" });
});


authRouter.post("/reset-password", (req: Request, res: Response) => {

    res.json({ message: "Password reset successful" });
});


authRouter.post("/verify-email", (req: Request, res: Response) => {

    res.json({ message: "Email verified" });
});

export default authRouter;