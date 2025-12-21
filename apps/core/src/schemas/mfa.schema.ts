import { z } from "zod";

export const verifyMfaSchema = z.object({
    code: z.string().length(6).regex(/^\d+$/, "Code must be 6 digits"),
});

export const disableMfaSchema = z.object({
    password: z.string().min(1),
});

export const useBackupCodeSchema = z.object({
    backupCode: z.string().min(1),
});
