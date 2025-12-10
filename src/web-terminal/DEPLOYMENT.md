# Web Terminal Deployment Guide

## Quick Deploy

```bash
# Using deployment script
./deploy.sh

# Or directly
npm run terminal
```

## Deployment Options

### 1. Local Development

```bash
cd lib/web-terminal
node start-server.js
```

Access at: `http://localhost:3000`

### 2. Docker Deployment

```bash
# Build and run
docker-compose up -d

# Or manually
docker build -f lib/web-terminal/Dockerfile -t theos-web-terminal .
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e RPC_URL=https://arb1.arbitrum.io/rpc \
  -e NETWORK=arbitrum \
  -v ~/.config/gcloud:/root/.config/gcloud:ro \
  theos-web-terminal
```

### 3. PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Deploy
./deploy.sh

# Or manually
pm2 start lib/web-terminal/web-terminal-server.js \
  --name "theos-web-terminal" \
  --env PORT=8080
```

### 4. Systemd Service

```bash
# Run as root
sudo ./deploy.sh

# Or manually create service
sudo systemctl start theos-web-terminal
```

### 5. Google Cloud Platform (Cloud Run)

```bash
# Deploy to GCP
./deploy-gcp.sh

# Or manually
gcloud run deploy theos-web-terminal \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 6. Environment Variables

```bash
export PORT=8080
export RPC_URL=https://arb1.arbitrum.io/rpc
export NETWORK=arbitrum
export GOOGLE_CLOUD_PROJECT=your-project-id
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

## Production Checklist

- [ ] Set environment variables
- [ ] Configure reverse proxy (nginx/caddy)
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Set up backups
- [ ] Configure firewall rules
- [ ] Set up health checks

## Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name terminal.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Health Check

```bash
# Check server status
curl http://localhost:8080/api/gcloud/status

# Expected response
{
  "success": true,
  "installed": true,
  "authenticated": true
}
```

## Monitoring

```bash
# PM2 monitoring
pm2 monit

# Systemd logs
journalctl -u theos-web-terminal -f

# Docker logs
docker logs -f theos-web-terminal
```

## Troubleshooting

### Port already in use
```bash
# Find process
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 node lib/web-terminal/web-terminal-server.js
```

### gcloud not found
```bash
# Install gcloud
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

### Permission denied
```bash
# Make scripts executable
chmod +x deploy.sh deploy-gcp.sh
```

## Security Notes

- Use HTTPS in production
- Restrict access with firewall rules
- Use environment variables for secrets
- Regularly update dependencies
- Monitor for suspicious activity
