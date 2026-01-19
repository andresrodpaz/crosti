# Docker Setup for Crosti App

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- Environment variables configured

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and fill in your values:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your actual Supabase and database credentials.

### 2. Build and Run with Docker Compose

\`\`\`bash
docker-compose up -d
\`\`\`

This will:
- Build the Docker image
- Start the application on port 3000
- Run in detached mode

### 3. View Logs

\`\`\`bash
docker-compose logs -f crosti-app
\`\`\`

### 4. Stop the Application

\`\`\`bash
docker-compose down
\`\`\`

## Manual Docker Build

If you prefer to build and run manually:

### Build the Image

\`\`\`bash
docker build -t crosti-app .
\`\`\`

### Run the Container

\`\`\`bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -e DATABASE_URL=your-db-url \
  crosti-app
\`\`\`

## Production Deployment

For production, ensure:

1. All environment variables are properly set
2. Use production Supabase URLs and keys
3. Configure proper networking and security
4. Set up SSL/TLS certificates
5. Use a reverse proxy (nginx) if needed

## Database Setup

After the first deployment, run the database migration scripts:

1. Connect to your Supabase/Neon database
2. Run scripts in order:
   - `scripts/000_reset_database.sql` (only if needed)
   - `scripts/001_complete_database_setup.sql`
   - `scripts/007_seed_developer_and_cookies.sql`

## Default Credentials

After running the seed script:

- **Developer Access**: arodpaz.dev@gmail.com / rodpaz0208
- **Admin Panel**: /admin
- **Developer Panel**: /developer

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, modify `docker-compose.yml`:

\`\`\`yaml
ports:
  - "8080:3000"  # Change 8080 to any available port
\`\`\`

### Permission Issues

Run Docker commands with sudo if needed:

\`\`\`bash
sudo docker-compose up -d
\`\`\`

### Database Connection Issues

Verify:
1. Database URL is correct in `.env`
2. Database is accessible from Docker container
3. Firewall rules allow connection
