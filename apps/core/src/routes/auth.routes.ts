import express, { type Request, type Response } from "express";
import { registerSchema, authSchema, forgotPasswordSchema } from "../schemas/auth.schema";
import { AuthService } from "../services/auth.service";
import { TokenService } from "../services/token.service";
import type { SessionDeviceType } from "../types/types";

const authRouter = express.Router();
const authService = AuthService.getInstance();
const tokenService = TokenService.getInstance();

authRouter.post("/register", async (req: Request, res: Response) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.message });
        }
        const { userId } = await authService.register(parsed.data);
        res.status(201).json({ message: "User registered", userId });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const parsed = authSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.message });
        }

        const getHeader = (key: string): string | undefined => {
            const val = req.headers[key];
            return Array.isArray(val) ? val[0] : val;
        };

        const parseLocation = (loc: any) => {
            if (!loc) return undefined;
            if (typeof loc === "string") {
                try {
                    return JSON.parse(loc);
                } catch {
                    return undefined;
                }
            }
            return loc;
        };

        const deviceType = (req.body.deviceType as SessionDeviceType) || "OTHER";
        const result = await authService.login({
            ...parsed.data,
            deviceType,
            os: getHeader("os") || "",
            ipAddress: req.ip || "",
            userAgent: req.get("user-agent") || "",
            browser: getHeader("browser") || "",
            location: parseLocation(getHeader("location")),
            rememberMe: getHeader("rememberme") === "true" ? true : false,
        });

        res.json({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user,
            sessionId: result.sessionId,
        });
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
});

authRouter.post("/logout", async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authorization header required" });
        }

        const token = authHeader.substring(7);
        const payload = tokenService.verifyAccessToken(token);

        await authService.logout(payload.sessionId);
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out" });
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
});

authRouter.post("/refresh", async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token required" });
        }

        const tokens = await authService.refresh(refreshToken);

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken: tokens.accessToken });
    } catch (error: any) {
        res.clearCookie("refreshToken");
        res.status(401).json({ error: error.message });
    }
});

authRouter.post("/forgot-password", async (req: Request, res: Response) => {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.message });
        }
        await authService.forgotPassword(parsed.data);
        res.json({ message: "If email exists, reset link sent" });
    } catch (error: any) {
        res.json({ message: "If email exists, reset link sent" });
    }
});

authRouter.post("/reset-password", async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: "Token and password required" });
        }
        await authService.resetPassword(token, password);
        res.json({ message: "Password reset successful" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.post("/verify-email", async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: "Token required" });
        }
        await authService.verifyEmail(token);
        res.json({ message: "Email verified" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default authRouter;