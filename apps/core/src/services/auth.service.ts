import { prisma } from "db";
import bcrypt from "bcrypt";
import { type RegisterInput, type AuthInput, type ForgotPasswordInput } from "../schemas/auth.schema";
import { TokenService } from "./token.service";
import type { SessionDeviceType, TokenPair } from "../types/types";

interface LoginInput extends AuthInput {
    deviceType: SessionDeviceType;
    os: string;
    ipAddress: string;
    userAgent: string;
    browser?: string;
    location?: {
        country?: string;
        region?: string;
        city?: string;
        timezone?: string;
    };
    rememberMe?: boolean;
}

interface LoginResult {
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; fullName: string };
    sessionId: string;
}

export class AuthService {
    private static authInstance: AuthService;
    private tokenService: TokenService;

    constructor() {
        this.tokenService = TokenService.getInstance();
    }

    public static getInstance(): AuthService {
        if (!AuthService.authInstance) {
            AuthService.authInstance = new AuthService();
        }
        return AuthService.authInstance;
    }

    async register(data: RegisterInput): Promise<{ userId: string }> {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) throw new Error("Email already registered");

        const passwordHash = await bcrypt.hash(data.password, 12);
        const user = await prisma.user.create({
            data: { fullName: data.name || "", email: data.email, passwordHash },
        });

        return { userId: user.id };
    }

    async login(data: LoginInput): Promise<LoginResult> {
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user || !user.passwordHash) throw new Error("Invalid credentials");

        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error("Account is temporarily locked. Try again later.");
        }

        const isValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValid) {
            await prisma.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: { increment: 1 } },
            });
            throw new Error("Invalid credentials");
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lastLoginAt: new Date(),
                lastLoginIp: data.ipAddress,
                lastLoginDevice: data.userAgent,
            },
        });

        const { session, tokens } = await this.tokenService.createSession({
            userId: user.id,
            email: user.email,
            deviceType: data.deviceType,
            os: data.os,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            browser: data.browser,
            location: data.location,
            rememberMe: data.rememberMe,
        });

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: { id: user.id, email: user.email, fullName: user.fullName },
            sessionId: session.id,
        };
    }

    async logout(sessionId: string): Promise<void> {
        await this.tokenService.revokeSession(sessionId, "USER_LOGOUT");
    }

    async refresh(refreshToken: string): Promise<TokenPair> {
        const { tokens } = await this.tokenService.rotateRefreshToken(refreshToken);
        return tokens;
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.passwordHash) throw new Error("User not found");

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) throw new Error("Current password is incorrect");

        const newPasswordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash, passwordChangedAt: new Date() },
        });

        await this.tokenService.revokeAllUserSessions(userId, "PASSWORD_CHANGE");
    }

    async forgotPassword(data: ForgotPasswordInput): Promise<void> {
        // TODO: Generate reset token, send email
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        // TODO: Validate token, update password
    }

    async verifyEmail(token: string): Promise<void> {
        // TODO: Validate token, mark email as verified
    }
}