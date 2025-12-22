export type SessionDeviceType = "MOBILE" | "DESKTOP" | "TABLET" | "TV" | "OTHER";

export interface AccessTokenPayload {
    iss: string;          // Issuer
    sub: string;          // userId
    sessionId: string;    // Session ID for revocation
    email: string;        // User email
    deviceType: string;   // Device type
    iat?: number;         // Issued at (auto-added by JWT)
    exp?: number;         // Expires at (auto-added by JWT)
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface SessionCreateInput {
    userId: string;
    email: string;
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