# WatchTower

**Secure, scalable authentication and user management for modern applications.**

WatchTower is a production-ready authentication service that handles user registration, login, session management, and security for your applications. Built for developers who need enterprise-grade auth without the complexity.

## What WatchTower Does

WatchTower handles all aspects of user authentication and management:

- **User Registration & Login** - Email/password authentication with secure password hashing
- **Social Login** - Sign in with Google, GitHub, Facebook, or Apple
- **Session Management** - Secure, long-lived sessions with automatic token refresh
- **Multi-Factor Authentication (MFA)** - Optional 2FA with TOTP (Google Authenticator, Authy)
- **Password Recovery** - Secure password reset via email
- **Email Verification** - Verify user email addresses on signup
- **User Profiles** - Manage user information, preferences, and settings
- **Device Tracking** - See all active sessions and devices
- **Security Alerts** - Notifications for suspicious login attempts
- **Audit Logging** - Complete history of all authentication events

## Quick Start

### For Application Developers

Integrate WatchTower into your app in minutes:

**1. Register a new user:**
```bash
curl -X POST https://api.yourapp.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe"
  }'
```

**2. Login and get tokens:**
```bash
curl -X POST https://api.yourapp.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "email_verified": false
  },
  "expiresIn": 900
}
```

**3. Make authenticated requests:**
```bash
curl -X GET https://api.yourapp.com/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Authentication Flows

### Registration Flow (Client ↔ Server)

```
┌─────────┐                                          ┌─────────┐
│ Client  │                                          │ Server  │
└────┬────┘                                          └────┬────┘
     │                                                    │
     │  POST /api/v1/auth/register                       │
     │  {                                                 │
     │    "email": "user@example.com",                   │
     │    "password": "SecurePass123!",                  │
     │    "full_name": "John Doe"                        │
     │  }                                                 │
     ├───────────────────────────────────────────────────>│
     │                                                    │
     │                            Validate input          │
     │                            Check email uniqueness  │
     │                            Hash password (bcrypt)  │
     │                            Create user in DB       │
     │                            Generate verify token   │
     │                            Queue welcome email     │
     │                                                    │
     │  201 Created                                       │
     │  {                                                 │
     │    "message": "Registration successful",          │
     │    "userId": "uuid-here"                          │
     │  }                                                 │
     │<───────────────────────────────────────────────────┤
     │                                                    │
     │                                                    │
     │                            [Background Worker]     │
     │                            Send verification email │
     │                                                    │
     │  (User receives email with link)                   │
     │                                                    │
     │  GET /api/v1/auth/verify-email?token=xyz          │
     ├───────────────────────────────────────────────────>│
     │                                                    │
     │                            Validate token          │
     │                            Mark email as verified  │
     │                            Delete used token       │
     │                                                    │
     │  200 OK                                            │
     │  {                                                 │
     │    "message": "Email verified successfully"       │
     │  }                                                 │
     │<───────────────────────────────────────────────────┤
     │                                                    │
```

**Key Steps:**

1. **Client sends registration data** - Email, password, and profile info
2. **Server validates and creates user**:
   - Validates email format and password strength
   - Checks if email already exists
   - Hashes password with bcrypt (12 rounds)
   - Creates user record in database
   - Generates verification token (32-byte random)
   - Stores token with 24-hour expiry
3. **Server queues email** - Sends to notification service via RabbitMQ
4. **Client receives success response** - With userId
5. **Background worker sends email** - With verification link
6. **User clicks verification link** - Opens in browser
7. **Server verifies token** - Marks email as verified
8. **Client receives confirmation** - User can now login

### Login & Token Refresh Flow (Client ↔ Server)

```
┌─────────┐                                          ┌─────────┐
│ Client  │                                          │ Server  │
└────┬────┘                                          └────┬────┘
     │                                                    │
     │  POST /api/v1/auth/login                          │
     │  {                                                 │
     │    "email": "user@example.com",                   │
     │    "password": "SecurePass123!",                  │
     │    "rememberMe": true                             │
     │  }                                                 │
     ├───────────────────────────────────────────────────>│
     │                                                    │
     │                            Find user by email      │
     │                            Verify password         │
     │                            Check account status    │
     │                            Check email verified    │
     │                            Create session in DB    │
     │                            Generate access JWT     │
     │                            Generate refresh token  │
     │                            Store in Redis cache    │
     │                                                    │
     │  200 OK                                            │
     │  Set-Cookie: accessToken=jwt...                   │
     │  Set-Cookie: refreshToken=xyz... (HttpOnly)       │
     │  {                                                 │
     │    "accessToken": "eyJhbGc...",                   │
     │    "user": { "id": "...", "email": "..." },       │
     │    "expiresIn": 900                               │
     │  }                                                 │
     │<───────────────────────────────────────────────────┤
     │                                                    │
     │  Store accessToken in memory/state                 │
     │  (refreshToken stored in HttpOnly cookie)          │
     │                                                    │
     │                                                    │
     │  ──────────── After 15 minutes ────────────        │
     │                                                    │
     │  GET /api/v1/users/me                             │
     │  Authorization: Bearer <expired-token>             │
     ├───────────────────────────────────────────────────>│
     │                                                    │
     │                            Validate JWT            │
     │                            Token expired!          │
     │                                                    │
     │  401 Unauthorized                                  │
     │  {                                                 │
     │    "error": "Token expired",                      │
     │    "code": "TOKEN_EXPIRED"                        │
     │  }                                                 │
     │<───────────────────────────────────────────────────┤
     │                                                    │
     │  Detect 401 TOKEN_EXPIRED                          │
     │                                                    │
     │  POST /api/v1/auth/refresh                        │
     │  Cookie: refreshToken=xyz...                       │
     ├───────────────────────────────────────────────────>│
     │                                                    │
     │                            Extract refresh token   │
     │                            Hash and lookup session │
     │                            Validate not expired    │
     │                            Validate not revoked    │
     │                            Generate new tokens     │
     │                            Rotate refresh token    │
     │                            Update session in DB    │
     │                            Update Redis cache      │
     │                                                    │
     │  200 OK                                            │
     │  Set-Cookie: accessToken=new-jwt...               │
     │  Set-Cookie: refreshToken=new-xyz...              │
     │  {                                                 │
     │    "accessToken": "eyJhbGc...",                   │
     │    "expiresIn": 900                               │
     │  }                                                 │
     │<───────────────────────────────────────────────────┤
     │                                                    │
     │  Update accessToken in memory                      │
     │                                                    │
     │  GET /api/v1/users/me                             │
     │  Authorization: Bearer <new-token>                 │
     ├───────────────────────────────────────────────────>│
     │                                                    │
     │                            Validate JWT            │
     │                            Token valid!            │
     │                            Fetch user data         │
     │                                                    │
     │  200 OK                                            │
     │  { "id": "...", "email": "..." }                  │
     │<───────────────────────────────────────────────────┤
     │                                                    │
```

**Key Steps:**

**Login:**
1. **Client sends credentials** - Email and password
2. **Server validates**:
   - Finds user by email
   - Verifies password with bcrypt
   - Checks account status (active/suspended)
   - Checks email is verified
3. **Server creates session**:
   - Generates access token (JWT, 15 min expiry)
   - Generates refresh token (random 32-byte, 30 days)
   - Creates session record with device info
   - Caches session in Redis for fast lookup
4. **Server sets cookies**:
   - `accessToken` - HttpOnly, Secure, SameSite=Lax
   - `refreshToken` - HttpOnly, Secure, SameSite=Lax, path=/api/auth/refresh
5. **Client stores tokens** - Access token in memory, refresh in cookie

**Token Refresh (Automatic):**
1. **Client makes API call** - With expired access token
2. **Server returns 401** - With TOKEN_EXPIRED error code
3. **Client detects expiry** - Intercepts 401 response
4. **Client calls refresh endpoint** - Sends refresh token from cookie
5. **Server validates refresh token**:
   - Hashes token and looks up session
   - Checks expiry (30 days max)
   - Checks not revoked
   - Validates user still active
6. **Server rotates tokens**:
   - Generates NEW access token (15 min)
   - Generates NEW refresh token (30 days)
   - Updates session in database
   - Updates Redis cache
7. **Server sends new tokens** - Sets new cookies
8. **Client retries original request** - With new access token
9. **Request succeeds** - User continues seamlessly

**Security Features:**
- **Access tokens expire quickly** (15 minutes) - Limits damage if stolen
- **Refresh tokens rotate** - Old refresh token invalidated on use
- **HttpOnly cookies** - JavaScript cannot access tokens (XSS protection)
- **Secure flag** - Cookies only sent over HTTPS
- **SameSite=Lax** - CSRF protection
- **Token family tracking** - Detects token reuse attacks
- **Session revocation** - All tokens invalidated on logout/password change

### For End Users

Your users get a seamless authentication experience:

**Registration Flow:**
1. Sign up with email and password (or social login)
2. Receive verification email
3. Click verification link
4. Start using your app

**Login Flow:**
1. Enter email and password
2. Optionally enable "Remember Me" for 30-day sessions
3. Complete 2FA if enabled
4. Access your account

**Security Features:**
- Automatic logout after 15 minutes of inactivity (with refresh)
- View all active sessions and devices
- Logout from all devices remotely
- Security alerts for new device logins
- Password strength requirements

## Features

### 🔐 Security First

- **Argon2id Password Hashing** - Industry-leading password security
- **JWT Access Tokens** - Short-lived (15 minutes) for security
- **Refresh Token Rotation** - Automatic token rotation on refresh
- **Rate Limiting** - Protection against brute force attacks
- **Account Lockout** - Automatic lockout after failed login attempts
- **HTTPS Only** - All traffic encrypted in transit
- **CSRF Protection** - Anti-CSRF tokens for state-changing operations

### 📱 Multi-Platform Support

- Web applications (React, Vue, Angular, etc.)
- Mobile apps (iOS, Android, React Native)
- TV apps (Android TV, Apple TV)
- Desktop applications
- Partner integrations via API

### 🌍 Social Login Providers

- Google
- GitHub
- Facebook
- Apple (coming soon)

### 👤 User Management

- Update profile information
- Change password
- Upload profile picture
- Set timezone and language preferences
- Delete account

### 📊 Session Management

Users can:
- View all active sessions
- See device information (type, browser, location)
- Revoke individual sessions
- Logout from all devices

### 🔔 Notifications

Automatic email notifications for:
- Welcome email on registration
- Email verification
- Password reset requests
- Suspicious login attempts
- New device logins
- Password changes

### 📈 Analytics & Insights

For administrators:
- User registration trends
- Login patterns
- Failed login attempts
- Active users by device/location
- Security events dashboard

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register new user |
| `/api/v1/auth/login` | POST | Login with credentials |
| `/api/v1/auth/logout` | POST | Logout current session |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/auth/forgot-password` | POST | Request password reset |
| `/api/v1/auth/reset-password` | POST | Reset password with token |
| `/api/v1/auth/verify-email` | POST | Verify email address |

### OAuth

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/oauth/google` | GET | Start Google OAuth flow |
| `/api/v1/auth/oauth/google/callback` | GET | Google OAuth callback |
| `/api/v1/auth/oauth/github` | GET | Start GitHub OAuth flow |
| `/api/v1/auth/oauth/github/callback` | GET | GitHub OAuth callback |

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/users/me` | GET | Get current user profile |
| `/api/v1/users/me` | PATCH | Update current user |
| `/api/v1/users/me` | DELETE | Delete account |
| `/api/v1/profile` | GET | Get user profile |
| `/api/v1/profile` | PATCH | Update profile |
| `/api/v1/profile/avatar` | POST | Upload avatar |

### Sessions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/sessions` | GET | List active sessions |
| `/api/v1/sessions/:id` | DELETE | Revoke specific session |
| `/api/v1/sessions` | DELETE | Revoke all sessions |

### Multi-Factor Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/mfa/setup` | POST | Enable 2FA |
| `/api/v1/mfa/verify` | POST | Complete 2FA setup |
| `/api/v1/mfa/disable` | POST | Disable 2FA |
| `/api/v1/mfa/validate` | POST | Validate 2FA code during login |

## Client SDKs

### JavaScript/TypeScript

```typescript
import { WatchTowerClient } from '@watchtower/client';

const client = new WatchTowerClient({
  apiUrl: 'https://api.yourapp.com',
});

// Register
await client.auth.register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  full_name: 'John Doe',
});

// Login
const { accessToken, user } = await client.auth.login({
  email: 'user@example.com',
  password: 'SecurePass123!',
});

// Get current user
const currentUser = await client.users.me();

// Update profile
await client.users.update({
  full_name: 'Jane Doe',
});
```

### React Hook

```tsx
import { useAuth } from '@watchtower/react';

function App() {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onSubmit={login} />;
  }

  return (
    <div>
      <h1>Welcome, {user.full_name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Configuration

### Environment Variables

```env
# Application
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/watchtower

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m

# Email (SendGrid)
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@yourapp.com

# OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Use Cases

### SaaS Applications
Perfect for multi-tenant SaaS apps that need user authentication, team management, and role-based access control.

### E-Commerce Platforms
Secure customer accounts, order history, saved addresses, and payment methods.

### Content Platforms
User authentication for streaming services, news sites, or content management systems.

### Mobile Apps
Backend authentication for iOS, Android, and cross-platform mobile applications.

### Partner APIs
Secure API access for third-party integrations and partner applications.

## Security

WatchTower implements industry best practices:

- **OWASP Compliant** - Follows OWASP authentication guidelines
- **SOC 2 Ready** - Built with compliance requirements in mind
- **GDPR Compatible** - User data deletion and export capabilities
- **Regular Security Audits** - Continuous security testing
- **Penetration Tested** - Regular third-party security assessments

## Support

- **Documentation:** [https://docs.watchtower.dev](https://docs.watchtower.dev)
- **API Reference:** [https://api.watchtower.dev](https://api.watchtower.dev)
- **Status Page:** [https://status.watchtower.dev](https://status.watchtower.dev)
- **Email:** support@watchtower.dev
- **GitHub Issues:** [https://github.com/watchtower/watchtower/issues](https://github.com/watchtower/watchtower/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Getting Started

Ready to integrate WatchTower into your application? Check out our [Quick Start Guide](docs/QUICKSTART.md) or explore the [API Documentation](docs/API.md).

For deployment and infrastructure setup, see [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md).
