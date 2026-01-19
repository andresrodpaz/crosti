# Crosti App - Setup Instructions

## Prerequisites

- Supabase account and project
- Node.js 18+ installed
- Git

## Database Setup (IMPORTANT - Follow this order!)

### Step 1: Reset Database (Optional, only if starting fresh)

If you need to start with a clean database:

\`\`\`bash

# Run in Supabase Scripts panel

scripts/000_reset_database.sql
\`\`\`

**Warning:** This will delete ALL data!

### Step 2: Create All Tables and Policies

This is **REQUIRED** before running any other scripts:

\`\`\`bash

# Run in Supabase Scripts panel

scripts/001_complete_database_setup.sql
\`\`\`

This script creates:

- All database tables (profiles, cookies, tags, colors, etc.)
- Row Level Security (RLS) policies
- Default data (colors, tags, landing config)

### Step 3: Create Your Admin User

**Option A: Sign up through the app first (Recommended)**

1. Start the app: `npm run dev`
2. Go to `/signin` and create your account
3. Your account will be created with 'viewer' role by default

**Option B: Create directly in database**

Run one of these seed scripts:
\`\`\`bash

# For arodpaz.dev@gmail.com

scripts/002_seed_admin_user.sql

# Or customize with your email

scripts/002_seed_initial_data.sql
\`\`\`

### Step 4: Upgrade to Developer Role (Optional)

If you need full access including landing page configuration:

1. Open `scripts/010_developer_role_setup.sql`
2. Replace `'your-email@example.com'` with your actual email
3. Run the script in Supabase Scripts panel

\`\`\`sql
UPDATE profiles
SET role = 'developer', updated_at = NOW()
WHERE email = 'your-actual-email@example.com';
\`\`\`

### Step 5: Add Sample Cookies (Optional)

\`\`\`bash

# Run in Supabase Scripts panel

scripts/007_seed_developer_and_cookies.sql
\`\`\`

## Environment Variables

Create a `.env.local` file with your Supabase credentials:

\`\`\`env

# Supabase Configuration

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (from Supabase)

DATABASE_URL=your_postgres_connection_string

# Development redirect URL for email confirmation

NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Common Errors and Solutions

### Error: "relation 'profiles' does not exist"

**Cause:** You tried to run a script before creating the tables.

**Solution:** Run `001_complete_database_setup.sql` first!

### Error: "No rows updated" when setting developer role

**Cause:** Your user doesn't exist in the database yet.

**Solution:**

1. Sign up through the app first (`/signin`)
2. Then run the developer role script with your email

### Error: "Authentication error" when accessing admin pages

**Cause:** Your user role is not set correctly.

**Solution:**

1. Check your role: `SELECT email, role FROM profiles WHERE email = 'your@email.com';`
2. Update if needed: `UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';`

## Role Permissions

| Role          | Permissions                                       |
| ------------- | ------------------------------------------------- |
| **viewer**    | View cookies and public pages                     |
| **editor**    | Create/edit cookies, tags, colors                 |
| **admin**     | All editor permissions + user management + delete |
| **developer** | All admin permissions + landing page config       |

## Quick Start Checklist

- [ ] Created Supabase project
- [ ] Set up environment variables in `.env.local`
- [ ] Ran `001_complete_database_setup.sql`
- [ ] Signed up through the app OR ran seed admin script
- [ ] (Optional) Upgraded to developer role via `010_developer_role_setup.sql`
- [ ] (Optional) Added sample cookies via `007_seed_developer_and_cookies.sql`
- [ ] Started the app: `npm run dev`
- [ ] Logged in and accessed admin dashboard

## Script Execution Order

Always follow this order:

1. `000_reset_database.sql` (optional, only if resetting)
2. `001_complete_database_setup.sql` (**REQUIRED FIRST**)
3. `002_seed_admin_user.sql` or `002_seed_initial_data.sql`
4. `010_developer_role_setup.sql` (optional, for developer role)
5. `007_seed_developer_and_cookies.sql` (optional, for sample data)

## Docker Setup

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for containerized deployment instructions.
