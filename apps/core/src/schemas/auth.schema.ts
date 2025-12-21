import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    email: z.email(),
    password: z.string().min(8).max(50),
});

export const authSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(50),
});

export const forgotPasswordSchema = z.object({
    email: z.email(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthInput = z.infer<typeof authSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
