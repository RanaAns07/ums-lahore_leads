# University Management System (UMS) - Production-Grade Backend

A production-ready University Management System built with NestJS, PostgreSQL, and Prisma, implementing enterprise-level identity management, RBAC, and comprehensive audit logging.

## 🏗️ Architecture Highlights

### Identity vs. User Separation
- **Person**: Immutable human identity data (source of truth)
- **User**: Auth credentials and account status
- 1:1 relationship between Person and User ensures data integrity

### Role-Based Access Control (RBAC)
- Granular permissions (e.g., `student.read`, `finance.write`)
- Role-to-permission mappings via junction tables
- Controller level enforcement with `@Permissions()` decorator
- Support for temporary role assignments with expiration

### Global Audit Logging
- Automatic capture of all POST, PATCH, DELETE operations
- Delta tracking (only changed values logged)
- JSONB storage for flexible query capabilities
- Actor, action, subject tracking with IP and user agent

### Security Features
- JWT with access (15m) and refresh tokens (7d)
- Refresh token storage and revocation
- Bcrypt password hashing (10 rounds)
- Global ValidationPipe with DTO validation
- Soft deletes for Person and User records

## 📦 Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma 7 with UUID primary keys
- **Authentication**: Passport-JWT
- **Validation**: class-validator, class-transformer

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your PostgreSQL credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/ums_db"
# JWT_ACCESS_SECRET="your-secret-key"
# JWT_REFRESH_SECRET="your-refresh-secret"
```

### Database Setup

```bash
# Run Prisma migration to create tables
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# (Optional) Seed initial data
# Create a seed script for roles and permissions
```

### Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api/v1`

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Revoke refresh token

### Person Management
- `POST /api/v1/person` - Create person (requires `person.create` permission)
- `GET /api/v1/person/:id` - Get person by ID (requires `person.read`)
- `GET /api/v1/person` - List all persons (requires `person.read`)
- `DELETE /api/v1/person/:id` - Soft delete person (requires `person.delete`)

### User Management
- `POST /api/v1/user` - Create user account (requires `user.create`)
- `GET /api/v1/user/:id` - Get user by ID (requires `user.read`)
- `GET /api/v1/user` - List all users (requires `user.read`)
- `PATCH /api/v1/user/:id` - Update user (requires `user.update`)
- `DELETE /api/v1/user/:id` - Soft delete user (requires `user.delete`)

## 🗂️ Project Structure

```
src/
├── common/
│   ├── decorators/          # @Permissions(), @CurrentUser()
│   ├── guards/              # JwtAuthGuard, PermissionsGuard
│   ├── interceptors/        # Global AuditInterceptor
│   ├── interfaces/          # TypeScript interfaces
│   └── prisma.service.ts    # Prisma client with soft delete middleware
├── config/
│   └── configuration.ts     # Centralized config loader
├── modules/
│   ├── person/              # Person entity (immutable identity)
│   ├── user/                # User entity (auth credentials)
│   ├── auth/                # JWT authentication & token management
│   ├── rbac/                # Role-based access control
│   └── audit/               # Audit logging service
├── app.module.ts            # Root application module
└── main.ts                  # Application bootstrap
```

## 🔒 Database Schema

### Core Models
- `Person` - Immutable identity (legal_name, date_of_birth, gender, nationality)
- `User` - Auth credentials (email, password_hash, mfa_secret, status)
- `Role` - System roles (admin, student, faculty)
- `Permission` - Granular permissions (resource.action format)
- `RolePermission` - Many-to-many role-permission mapping
- `RoleAssignment` - User-role assignments with optional expiration
- `RefreshToken` - JWT refresh tokens for revocation
- `AuditLog` - Comprehensive audit trail

All tables use UUID primary keys and include created_at/updated_at timestamps.

## 🛡️ Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **Password Requirements**: Minimum 8 characters with uppercase, lowercase, and number/symbol
3. **Token Expiration**: Short-lived access tokens (15m), longer refresh tokens (7d)
4. **Soft Deletes**: Person and User records are never physically deleted
5. **RBAC Enforcement**: All endpoints protected by JWT + PermissionsGuard

## 🧪 Next Steps (Manual Verification Required)

1. **Set up PostgreSQL database**
2. **Run Prisma migrations**: `npx prisma migrate dev --name init`
3. **Create seed data**: Roles and permissions for your organization
4. **Test authentication flow**: Register user, login, refresh token
5. **Test RBAC**: Assign roles and verify permission enforcement
6. **Test audit logging**: Perform operations and query audit logs

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ums_db?schema=public"
JWT_ACCESS_SECRET="change-this-to-a-strong-secret"
JWT_REFRESH_SECRET="change-this-to-another-strong-secret"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
NODE_ENV="development"
PORT=3000
```

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. All new endpoints must use `@Permissions()` decorator
3. DTOs must have proper validation decorators
4. Services should inject PrismaService for database access

## 📄 License

MIT

## 👥 Support

For questions or issues, please contact the development team.
