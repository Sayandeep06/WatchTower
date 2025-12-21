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
