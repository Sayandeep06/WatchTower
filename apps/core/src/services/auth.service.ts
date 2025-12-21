import { prisma } from "db";
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

    async register(data: RegisterInput): Promise<void> {
        const user = await prisma.user.create({
            data: {
                fullName: data.name || "",
                email: data.email,
                passwordHash: data.password,
            },
        });
    }
    async login(data: AuthInput): Promise<void> {

    }
    async logout(data: AuthInput) {

    }
    async refresh(data: AuthInput) {

    }
    async forgotPassword(data: ForgotPasswordInput) {

    }
    async resetPassword(data: ForgotPasswordInput) {

    }
    async verifyEmail(data: ForgotPasswordInput) {

    }
}