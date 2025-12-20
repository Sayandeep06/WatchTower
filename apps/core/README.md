# WatchTower Core API

Express.js-based authentication and user management API service.

## Overview

This is the core API service for WatchTower, built with Express.js and TypeScript. It handles all authentication, user management, session management, and OAuth flows.

## Tech Stack

- **Runtime:** Bun
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma)
- **Cache:** Redis
- **Authentication:** JWT + Refresh Tokens
- **Validation:** Zod
- **Password Hashing:** Argon2id

## Installation

Install dependencies:

```bash
bun install
```

## Configuration

Create a `.env` file in the `apps/core` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/watchtower

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourapp.com
FRONTEND_URL=http://localhost:3001

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/oauth/google/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/oauth/github/callback
```

## Running the Application

### Development

Start the development server with hot reload:

```bash
bun run dev
```

### Production

Build and start the production server:

```bash
bun run build
bun start
```

## Project Structure

```
apps/core/
├── src/
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── models/          # Database models (Prisma)
│   ├── utils/           # Utility functions
│   ├── validators/      # Request validation schemas
│   ├── config/          # Configuration files
│   └── index.ts         # Application entry point
├── tests/               # Test files
├── package.json
└── tsconfig.json
```

## API Routes

### Authentication Routes (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - Logout current session
- `POST /refresh` - Refresh access token
- `POST /verify-email` - Verify email address
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

### OAuth Routes (`/api/v1/auth/oauth`)
- `GET /google` - Start Google OAuth flow
- `GET /google/callback` - Google OAuth callback
- `GET /github` - Start GitHub OAuth flow
- `GET /github/callback` - GitHub OAuth callback

### User Routes (`/api/v1/users`)
- `GET /me` - Get current user profile
- `PATCH /me` - Update current user
- `DELETE /me` - Delete user account

### Session Routes (`/api/v1/sessions`)
- `GET /` - List all active sessions
- `DELETE /:id` - Revoke specific session
- `DELETE /` - Revoke all sessions

### MFA Routes (`/api/v1/mfa`)
- `POST /setup` - Enable 2FA
- `POST /verify` - Complete 2FA setup
- `POST /disable` - Disable 2FA
- `POST /validate` - Validate 2FA code during login

## Middleware

The Express app uses the following middleware stack:

1. **CORS** - Cross-origin resource sharing
2. **Helmet** - Security headers
3. **Morgan** - HTTP request logging
4. **Express JSON** - Body parsing
5. **Cookie Parser** - Cookie parsing
6. **Rate Limiting** - Brute force protection
7. **Request ID** - Correlation ID tracking
8. **Error Handler** - Centralized error handling

## Security Features

- **Rate Limiting** - Prevents brute force attacks
- **Helmet** - Sets security HTTP headers
- **CORS** - Configured for specific origins
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma ORM
- **XSS Protection** - Input sanitization
- **CSRF Tokens** - Anti-CSRF protection
- **Secure Cookies** - HttpOnly, Secure, SameSite flags

## Testing

Run tests:

```bash
bun test
```

Run tests with coverage:

```bash
bun test:coverage
```

## Database Migrations

Run migrations:

```bash
bun run migrate
```

Generate Prisma client:

```bash
bun run db:generate
```

## Linting & Formatting

Lint code:

```bash
bun run lint
```

Format code:

```bash
bun run format
```

## Health Check

The API includes a health check endpoint:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-21T10:00:00.000Z",
  "uptime": 1234.56,
  "database": "connected",
  "redis": "connected"
}
```
