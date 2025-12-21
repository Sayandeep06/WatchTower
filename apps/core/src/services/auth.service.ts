import { prisma } from "db";
import bcrypt from "bcrypt";
import { type RegisterInput, type AuthInput, type ForgotPasswordInput } from "../schemas/auth.schema";

export class AuthService {
    private static authInstance: AuthService;
    constructor() {

    }

    public static getInstance(): AuthService {
        if (!AuthService.authInstance) {
            AuthService.authInstance = new AuthService();
        }
        return AuthService.authInstance;
    }

    async register(data: RegisterInput): Promise<{ userId: string }> {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new Error("Email already registered");
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                fullName: data.name || "",
                email: data.email,
                passwordHash,
            },
        });

        return { userId: user.id };
    }

    async login(data: AuthInput): Promise<{ userId: string; email: string }> {
        const user = await prisma.user.findUnique({ where: { email: data.email } });

        if (!user || !user.passwordHash) {
            throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(data.password, user.passwordHash);

        if (!isValid) {
            throw new Error("Invalid credentials");
        }

        return { userId: user.id, email: user.email };
    }

    async logout(sessionId: string) {
    }

    async refresh(refreshToken: string) {
    }

    async forgotPassword(data: ForgotPasswordInput) {
    }

    async resetPassword(token: string, newPassword: string) {
    }

    async verifyEmail(token: string) {
    }
}