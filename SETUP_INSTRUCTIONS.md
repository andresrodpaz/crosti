# Crosti - Setup Instructions

## Database Setup

### 1. Reset and Create Database (First Time Only)

Execute these scripts in your Supabase SQL Editor in order:

1. **Reset Database** (only if needed):
\`\`\`sql
-- Run scripts/000_reset_database.sql
\`\`\`

2. **Create Tables and Policies**:
\`\`\`sql
-- Run scripts/001_complete_database_setup.sql
\`\`\`

3. **Seed Admin User**:
\`\`\`sql
-- Run scripts/002_seed_admin_user.sql
\`\`\`

### 2. Create Your Developer Account

1. Go to `/developer/login` in your browser
2. Click "Sign Up" (or create account via Supabase Dashboard → Authentication → Users)
3. Use your email (e.g., `developer@crosti.com`)
4. Copy your user UUID from Supabase Dashboard → Authentication → Users
5. Update `scripts/002_seed_admin_user.sql` with your UUID and run it

## Access Levels

### Admin Panel (`/admin`)
- **Route**: `/admin/login` → `/admin`
- **Role Required**: `admin` or `editor`
- **Can Manage**:
  - Galletas (cookies)
  - Etiquetas (tags)
  - Colores (colors)
  - Usuarios (users)

### Developer Panel (`/developer`)
- **Route**: `/developer/login` → `/developer`
- **Role Required**: `developer` or `admin`
- **Can Manage**:
  - Landing page configuration
  - Hero section (title, subtitle, images)
  - Features section
  - Campaigns and custom sections

## Default Credentials

### Admin Account
- Email: `admin@crosti.com`
- Password: `crosti2025`
- Role: `admin`

### Developer Account
- Create your own account via `/developer/login`
- Update the role to `developer` via SQL

## File Structure

\`\`\`
scripts/
├── 000_reset_database.sql          # Drop all tables (use with caution)
├── 001_complete_database_setup.sql # Create all tables and RLS policies
└── 002_seed_admin_user.sql         # Insert admin and developer users

app/
├── admin/
│   ├── login/page.tsx              # Admin login
│   └── page.tsx                    # Admin dashboard
└── developer/
    ├── login/page.tsx              # Developer login
    └── page.tsx                    # Developer dashboard (landing config)

components/admin/
├── cookies-admin.tsx               # Cookie management
├── colors-admin.tsx                # Color management
├── tags-admin.tsx                  # Tag management
├── users-admin.tsx                 # User management
├── roles-guide.tsx                 # Role permissions guide
└── landing-admin.tsx               # Landing page config (developer only)
\`\`\`

## Environment Variables

Make sure these are set in your Vercel project:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
\`\`\`

## Troubleshooting

### "Usuario sin perfil configurado"
- Make sure the user has a profile in the `profiles` table
- Check that the role is correct (`admin`, `editor`, `viewer`, or `developer`)

### RLS Errors
- Verify RLS policies are created correctly
- Check that the user's role matches the required permissions

### Images Not Loading
- Images are stored as base64 in the database
- For production, consider using Vercel Blob or Supabase Storage
