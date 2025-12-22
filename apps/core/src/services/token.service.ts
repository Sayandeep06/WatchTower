import { prisma } from "db";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { AccessTokenPayload, SessionCreateInput, TokenPair } from "../types/types";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "your-access-token-secret-change-in-production";
const ACCESS_TOKEN_EXPIRY = "15m";
const REMEMBER_ME_EXPIRY_DAYS = 30;
const DEFAULT_EXPIRY_DAYS = 1;

export class TokenService {
    private static tokenInstance: TokenService;

    constructor() { }

    public static getInstance(): TokenService {
        if (!TokenService.tokenInstance) {
            TokenService.tokenInstance = new TokenService();
        }
        return TokenService.tokenInstance;
    }

    async createSession(input: SessionCreateInput): Promise<{ session: { id: string }; tokens: TokenPair }> {
        const { userId, email, deviceType, os, ipAddress, userAgent, browser, location, rememberMe = false } = input;

        const expiryDays = rememberMe ? REMEMBER_ME_EXPIRY_DAYS : DEFAULT_EXPIRY_DAYS;
        const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
        const { token: refreshToken, hash: refreshTokenHash } = this.generateRefreshToken();
        const accessTokenJti = crypto.randomUUID();

        const session = await prisma.session.create({
            data: {
                userId,
                refreshTokenHash,
                accessTokenJti,
                deviceType,
                browser: browser || null,
                os,
                ipAddress,
                userAgent,
                location: location || undefined,
                rememberMe,
                expiresAt,
                lastActivityAt: new Date(),
            },
        });

        const accessToken = this.generateAccessToken({
            userId,
            sessionId: session.id,
            email,
            deviceType,
            jti: accessTokenJti,
        });

        return {
            session: { id: session.id },
            tokens: { accessToken, refreshToken },
        };
    }

    async revokeSession(sessionId: string, reason: string = "USER_LOGOUT"): Promise<void> {
        await prisma.session.update({
            where: { id: sessionId },
            data: {
                revokedAt: new Date(),
                revokedReason: reason,
            },
        });
    }

    async revokeAllUserSessions(userId: string, reason: string = "PASSWORD_CHANGE"): Promise<number> {
        const result = await prisma.session.updateMany({
            where: { userId, revokedAt: null },
            data: {
                revokedAt: new Date(),
                revokedReason: reason,
            },
        });
        return result.count;
    }

    private generateAccessToken(params: {
        userId: string;
        sessionId: string;
        email: string;
        deviceType: string;
        jti: string;
    }): string {
        const payload: Omit<AccessTokenPayload, "iat" | "exp"> = {
            iss: "watchtower",
            sub: params.userId,
            sessionId: params.sessionId,
            email: params.email,
            deviceType: params.deviceType,
        };

        return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY,
            jwtid: params.jti,
        });
    }

    verifyAccessToken(token: string): AccessTokenPayload {
        try {
            return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error("Access token expired");
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error("Invalid access token");
            }
            throw error;
        }
    }

    private generateRefreshToken(): { token: string; hash: string } {
        const tokenBytes = crypto.randomBytes(32);
        const token = tokenBytes.toString("base64url");
        const hash = crypto.createHash("sha256").update(token).digest("hex");
        return { token, hash };
    }

    async validateRefreshToken(refreshToken: string): Promise<{
        session: { id: string; userId: string; rememberMe: boolean };
        user: { id: string; email: string };
    }> {
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await prisma.session.findUnique({
            where: { refreshTokenHash: tokenHash },
            include: { user: { select: { id: true, email: true } } },
        });

        if (!session) throw new Error("Invalid refresh token");
        if (session.revokedAt) throw new Error("Session has been revoked");
        if (session.expiresAt < new Date()) throw new Error("Session has expired");

        return {
            session: { id: session.id, userId: session.userId, rememberMe: session.rememberMe },
            user: session.user,
        };
    }

    async rotateRefreshToken(oldRefreshToken: string): Promise<{ tokens: TokenPair; sessionId: string }> {
        const { session, user } = await this.validateRefreshToken(oldRefreshToken);

        const { token: newRefreshToken, hash: newRefreshTokenHash } = this.generateRefreshToken();
        const newAccessTokenJti = crypto.randomUUID();

        const expiryDays = session.rememberMe ? REMEMBER_ME_EXPIRY_DAYS : DEFAULT_EXPIRY_DAYS;
        const newExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

        const fullSession = await prisma.session.findUnique({
            where: { id: session.id },
            select: { deviceType: true },
        });

        await prisma.session.update({
            where: { id: session.id },
            data: {
                refreshTokenHash: newRefreshTokenHash,
                accessTokenJti: newAccessTokenJti,
                lastActivityAt: new Date(),
                expiresAt: newExpiresAt,
            },
        });

        const newAccessToken = this.generateAccessToken({
            userId: session.userId,
            sessionId: session.id,
            email: user.email,
            deviceType: fullSession?.deviceType || "OTHER",
            jti: newAccessTokenJti,
        });

        return {
            tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
            sessionId: session.id,
        };
    }

    async getUserActiveSessions(userId: string) {
        return prisma.session.findMany({
            where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
            select: {
                id: true,
                deviceType: true,
                browser: true,
                os: true,
                ipAddress: true,
                location: true,
                lastActivityAt: true,
                createdAt: true,
            },
            orderBy: { lastActivityAt: "desc" },
        });
    }

    async cleanupExpiredSessions(): Promise<number> {
        const result = await prisma.session.deleteMany({
            where: {
                OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
            },
        });
        return result.count;
    }
}