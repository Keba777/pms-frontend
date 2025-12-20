# Docker Deployment - Quick Reference

## 🚀 Quick Start Commands

### Build and Run (Development/Testing)
```bash
# Build and start in foreground (see logs)
docker compose up --build

# Build and start in background
docker compose up --build -d

# View logs
docker compose logs -f pms-frontend
```

### Production Deployment (VPS)
```bash
# 1. Ensure .env file exists with your variables
# 2. Build and start
docker compose up -d --build

# 3. Check status
docker compose ps

# 4. View logs
docker compose logs -f pms-frontend
```

## 📋 Management Commands

```bash
# Stop container
docker compose stop

# Start container
docker compose start

# Restart container
docker compose restart

# Stop and remove container
docker compose down

# Stop and remove container + volumes
docker compose down -v

# View container stats
docker stats pms-frontend

# Execute shell inside container
docker exec -it pms-frontend sh
```

## 🔧 Troubleshooting

### Network Timeout During Build
If you encounter "TLS handshake timeout" errors:

```bash
# Option 1: Wait and retry
docker compose up --build -d

# Option 2: Pull image separately first
docker pull node:20-alpine
docker compose up --build -d

# Option 3: Use different DNS
# Add to /etc/docker/daemon.json:
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
# Then restart Docker: sudo systemctl restart docker
```

### Port Already in Use
```bash
# Check what's using port 3030
sudo lsof -i :3030

# Kill the process or change port in docker-compose.yml
```

### Environment Variables Not Working
```bash
# Verify .env file exists
cat .env

# Check variables inside container
docker exec pms-frontend env | grep NEXT_PUBLIC
```

## 🌐 Access Your Application

- **Local**: http://localhost:3030
- **VPS**: http://your-vps-ip:3030
- **With Domain**: Configure Nginx reverse proxy (see deployment_guide.md)

## 📦 Files Created

- `Dockerfile` - Multi-stage production build
- `docker-compose.yml` - Container orchestration
- `.dockerignore` - Build optimization
- `next.config.ts` - Updated with standalone output

## 🔐 Environment Variables

Required in `.env` file:
```env
NEXT_PUBLIC_BASE_URL=https://api.nilepms.com/api/v1/
NEXT_PUBLIC_SUPABASE_URL=https://vthmfslnljycsovfuclj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

The docker-compose.yml includes fallback values if .env is missing.

## ✅ Health Check

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' pms-frontend

# Manual health check
curl http://localhost:3030
```

## 🔄 Update Deployment

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build

# Or rebuild without cache
docker compose build --no-cache
docker compose up -d
```
