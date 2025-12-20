-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET', 'PHONE_VERIFY');

-- CreateEnum
CREATE TYPE "SessionDeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'TABLET', 'TV', 'OTHER');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_COMPLETE', 'EMAIL_VERIFY', 'MFA_ENABLE', 'MFA_DISABLE', 'MFA_CHALLENGE', 'SESSION_REVOKE', 'ACCOUNT_LOCKED', 'SUSPICIOUS_ACTIVITY', 'NEW_DEVICE_LOGIN', 'PROFILE_UPDATE', 'EMAIL_CHANGE', 'ACCOUNT_DELETE');

-- CreateEnum
CREATE TYPE "SecurityEventSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "MFAMethod" AS ENUM ('TOTP', 'SMS');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" VARCHAR(255),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "suspensionReason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "fullName" VARCHAR(255) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" VARCHAR(45),
    "lastLoginDevice" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "refreshTokenHash" VARCHAR(255) NOT NULL,
    "accessTokenJti" VARCHAR(255),
    "deviceType" "SessionDeviceType" NOT NULL,
    "browser" VARCHAR(100),
    "os" VARCHAR(100),
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" TEXT NOT NULL,
    "location" JSONB,
    "rememberMe" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" VARCHAR(255),
    "revokedBy" VARCHAR(50),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "email" VARCHAR(255) NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "type" "VerificationTokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "usedIp" VARCHAR(45),
    "metadata" JSONB,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "email" VARCHAR(255),
    "eventType" "SecurityEventType" NOT NULL,
    "severity" "SecurityEventSeverity" NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" TEXT,
    "location" JSONB,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfa_secrets" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "secret" VARCHAR(255) NOT NULL,
    "method" "MFAMethod" NOT NULL DEFAULT 'TOTP',
    "backupCodes" VARCHAR(255)[],
    "backupCodesUsed" INTEGER NOT NULL DEFAULT 0,
    "qrCodeUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mfa_secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_entries" (
    "id" UUID NOT NULL,
    "identifier" VARCHAR(255) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "count" INTEGER NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failureReason" VARCHAR(255),
    "mfaUsed" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" VARCHAR(45) NOT NULL,
    "deviceType" VARCHAR(50) NOT NULL,
    "browser" VARCHAR(100),
    "os" VARCHAR(100),
    "userAgent" TEXT NOT NULL,
    "location" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "to" VARCHAR(255) NOT NULL,
    "from" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "template" VARCHAR(100) NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "providerId" VARCHAR(255),
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_accountStatus_idx" ON "users"("accountStatus");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshTokenHash_key" ON "sessions"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "sessions_userId_expiresAt_idx" ON "sessions"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_tokenHash_key" ON "verification_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "verification_tokens_email_idx" ON "verification_tokens"("email");

-- CreateIndex
CREATE INDEX "verification_tokens_type_idx" ON "verification_tokens"("type");

-- CreateIndex
CREATE INDEX "verification_tokens_expiresAt_idx" ON "verification_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "verification_tokens_email_type_idx" ON "verification_tokens"("email", "type");

-- CreateIndex
CREATE INDEX "security_events_userId_idx" ON "security_events"("userId");

-- CreateIndex
CREATE INDEX "security_events_eventType_idx" ON "security_events"("eventType");

-- CreateIndex
CREATE INDEX "security_events_severity_idx" ON "security_events"("severity");

-- CreateIndex
CREATE INDEX "security_events_createdAt_idx" ON "security_events"("createdAt");

-- CreateIndex
CREATE INDEX "security_events_flagged_idx" ON "security_events"("flagged");

-- CreateIndex
CREATE INDEX "security_events_userId_eventType_idx" ON "security_events"("userId", "eventType");

-- CreateIndex
CREATE INDEX "security_events_userId_createdAt_idx" ON "security_events"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "mfa_secrets_userId_key" ON "mfa_secrets"("userId");

-- CreateIndex
CREATE INDEX "rate_limit_entries_identifier_action_idx" ON "rate_limit_entries"("identifier", "action");

-- CreateIndex
CREATE INDEX "rate_limit_entries_windowEnd_idx" ON "rate_limit_entries"("windowEnd");

-- CreateIndex
CREATE INDEX "login_history_userId_idx" ON "login_history"("userId");

-- CreateIndex
CREATE INDEX "login_history_userId_createdAt_idx" ON "login_history"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "email_logs_userId_idx" ON "email_logs"("userId");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "email_logs_template_idx" ON "email_logs"("template");

-- CreateIndex
CREATE INDEX "email_logs_createdAt_idx" ON "email_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mfa_secrets" ADD CONSTRAINT "mfa_secrets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
