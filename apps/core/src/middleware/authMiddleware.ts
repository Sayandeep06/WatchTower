import { type Request, type Response, type NextFunction } from "express";
import { TokenService } from "../services/token.service";
import type { AccessTokenPayload } from "../types/types";

const tokenService = TokenService.getInstance();

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid authorization header" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Missing token" });
        }

        const payload = tokenService.getTokenPayload(token);

        const session = await tokenService.validateSession(payload.sessionId);

        if (session.accessTokenJti !== payload.jti) {
            return res.status(401).json({ error: "Token has been rotated or revoked" });
        }

        req.user = payload;
        next();
    } catch (error) {
        if (error instanceof Error) {
            return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}
