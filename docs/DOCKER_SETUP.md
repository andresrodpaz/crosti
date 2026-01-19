# 🐳 Docker Setup Guide - Crosti App

Complete guide for running Crosti App with Docker in development and production environments.

## 📋 Prerequisites

- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (2.0+)
- Node.js 20+ (for local development)
- Git

## 🚀 Quick Start

### 1. Clone and Configure

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd crosti-app

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local
\`\`\`

### 2. Run with Docker Compose

\`\`\`bash
# Build and start the application
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build

# View logs
docker-compose logs -f
\`\`\`

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Health Check**: http://localhost:3000/api/health

## 🛠️ Docker Commands Reference

### Basic Operations

\`\`\`bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f crosti-app

# Execute commands in container
docker-compose exec crosti-app sh
\`\`\`

### Build & Rebuild

\`\`\`bash
# Build without cache (clean build)
docker-compose build --no-cache

# Rebuild and start
docker-compose up --build

# Remove all containers and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
\`\`\`

### Debugging

\`\`\`bash
# View container status
docker-compose ps

# Inspect container
docker inspect crosti-app

# View container resource usage
docker stats crosti-app

# Access container shell
docker-compose exec crosti-app sh
\`\`\`

## 📦 Standalone Docker (without Docker Compose)

### Build the Image

\`\`\`bash
# Build for your platform
docker build -t crosti-app:latest .

# Build for specific platform (e.g., for deployment)
docker build --platform linux/amd64 -t crosti-app:latest .
\`\`\`

### Run the Container

\`\`\`bash
# Run with environment file
docker run -p 3000:3000 --env-file .env.local crosti-app:latest

# Run with individual environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  crosti-app:latest

# Run in detached mode with auto-restart
docker run -d \
  --name crosti-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.local \
  crosti-app:latest
\`\`\`

## 🔧 Production Deployment

### Environment Variables

For production, set these environment variables:

\`\`\`bash
# Required Supabase Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Connection
SUPABASE_POSTGRES_URL=postgresql://...
DATABASE_URL=postgresql://...

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
\`\`\`

### Deploy to Production

\`\`\`bash
# Build for production
docker-compose -f docker-compose.yml build

# Start in production mode
docker-compose -f docker-compose.yml up -d

# Monitor logs
docker-compose -f docker-compose.yml logs -f
\`\`\`

### Health Monitoring

The application includes a health check endpoint:

\`\`\`bash
# Check health status
curl http://localhost:3000/api/health

# Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
\`\`\`

## 🐳 Multi-Platform Builds

For deploying to different architectures (e.g., ARM64 for Raspberry Pi, AMD64 for servers):

\`\`\`bash
# Setup buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t crosti-app:latest \
  --push .
\`\`\`

## 🔍 Troubleshooting

### Container won't start

\`\`\`bash
# Check logs
docker-compose logs crosti-app

# Common issues:
# 1. Missing environment variables
# 2. Port 3000 already in use
# 3. Database connection failed
\`\`\`

### Port 3000 already in use

\`\`\`bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port in docker-compose.yml
ports:
  - "3001:3000"
\`\`\`

### Database connection issues

\`\`\`bash
# Verify environment variables
docker-compose exec crosti-app env | grep SUPABASE

# Test database connection
docker-compose exec crosti-app sh
# Inside container:
node -e "console.log(process.env.SUPABASE_POSTGRES_URL)"
\`\`\`

### Clean everything and start fresh

\`\`\`bash
# Remove containers, networks, volumes
docker-compose down -v

# Remove images
docker rmi crosti-app

# Clean Docker system
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
\`\`\`

## 📊 Performance Optimization

### Image Size Optimization

The Dockerfile uses multi-stage builds to minimize image size:

- **Base image**: Alpine Linux (~5MB)
- **Dependencies**: Only production dependencies
- **Final image**: ~200-300MB (optimized)

### Resource Limits

Configure in `docker-compose.yml`:

\`\`\`yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
\`\`\`

## 🔐 Security Best Practices

1. **Non-root user**: Container runs as `nextjs` user (UID 1001)
2. **Minimal image**: Alpine Linux reduces attack surface
3. **Environment variables**: Never commit secrets to Git
4. **Health checks**: Automatic restart on failure
5. **Network isolation**: Uses dedicated Docker network

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Supabase with Docker](https://supabase.com/docs/guides/self-hosting/docker)

## 💡 Tips

- Use `.dockerignore` to exclude unnecessary files from build
- Enable BuildKit for faster builds: `export DOCKER_BUILDKIT=1`
- Use `docker-compose up --build` to rebuild on code changes
- Monitor logs with `docker-compose logs -f` during development
- Use health checks for automatic recovery in production

---

**Need help?** Check the [main documentation](../README.md) or open an issue on GitHub.
