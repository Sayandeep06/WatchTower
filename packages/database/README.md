# WatchTower Database Package

Shared database package for WatchTower using Prisma ORM with PostgreSQL.

## Overview

This package contains the Prisma schema, migrations, and database utilities shared across the WatchTower monorepo.

## Tech Stack

- **ORM:** Prisma
- **Database:** PostgreSQL
- **Migration Tool:** Prisma Migrate
- **Schema Language:** Prisma Schema Language

## Installation

Install dependencies:

```bash
bun install
```

## Database Setup

### Prerequisites

- PostgreSQL 14+ installed and running
- Database created (e.g., `watchtower`)

### Environment Variables

Create a `.env` file in the `packages/database` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/watchtower?schema=public"
```

### Generate Prisma Client

Generate the Prisma Client:

```bash
bun run db:generate
```

### Run Migrations

Apply all migrations to the database:

```bash
bun run db:migrate
```

### Seed Database (Optional)

Seed the database with initial data:

```bash
bun run db:seed
```

## Prisma Commands

### Create a new migration

```bash
bun run db:migrate:create
```

### Reset database (⚠️ destructive)

```bash
bun run db:reset
```

### Open Prisma Studio

Prisma Studio is a GUI for viewing and editing data:

```bash
bun run db:studio
```

## Database Models

The database schema includes the following main models:

### User
- User account information
- Authentication credentials
- Profile data
- Account status

### Session
- Active user sessions
- Refresh tokens
- Device information
- Session metadata

### OAuth Provider
- Social login connections
- Provider-specific data
- Linked accounts

### Verification Token
- Email verification tokens
- Password reset tokens
- Token expiration

### Security Event
- Login attempts
- Security alerts
- Audit log entries

### MFA Secret
- Two-factor authentication secrets
- Backup codes
- Recovery codes

## Usage in Express.js App

Import the Prisma client in your Express app:

```typescript
import { prisma } from '@watchtower/database';

// Example: Find user by email
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});

// Example: Create a new session
const session = await prisma.session.create({
  data: {
    userId: user.id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    deviceInfo: {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    }
  }
});
```

## Database Schema Organization

```
packages/database/
├── prisma/
│   ├── schema.prisma      # Main Prisma schema
│   ├── migrations/        # Database migrations
│   └── seed.ts           # Database seeding script
├── src/
│   └── index.ts          # Exports Prisma client
├── package.json
└── README.md
```

## Best Practices

1. **Always use migrations** - Never modify the database schema directly
2. **Test migrations locally first** - Before applying to production
3. **Use transactions** - For operations that must succeed or fail together
4. **Optimize queries** - Use `select` to fetch only needed fields
5. **Index frequently queried fields** - Add indexes for performance
6. **Use connection pooling** - Configure proper connection limits

## Connection Pooling

For production, configure connection pooling:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/watchtower?schema=public&connection_limit=10&pool_timeout=20"
```

## Troubleshooting

### Migration conflicts

If you have migration conflicts:

```bash
# Reset the database (development only)
bun run db:reset

# Or resolve manually
bun run db:migrate:resolve
```

### Prisma Client out of sync

If Prisma Client is out of sync with the schema:

```bash
bun run db:generate
```

### Connection issues

Check your `DATABASE_URL` and ensure:
- PostgreSQL is running
- Database exists
- Credentials are correct
- Network access is allowed
