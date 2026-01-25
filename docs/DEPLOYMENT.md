# Deployment Guide

This guide covers all deployment options for the Budgeting App, from local development to production hosting.

## Table of Contents

- [Local Development](#local-development)
- [Production Web Deployment](#production-web-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloudflare Workers Deployment](#cloudflare-workers-deployment)
- [Electron Desktop App](#electron-desktop-app)
- [Environment Configuration](#environment-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Local Development

### Express Server (Recommended for Development)

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Access at: `http://localhost:3000`

**Configuration:**
- Port: `3000` (default) or set `PORT` environment variable
- Hot reload: No (restart server for changes)
- Logs: Console output

### Development Tips

- Use browser DevTools for debugging
- Check console for JavaScript errors
- Monitor Network tab for failed requests
- Test in multiple browsers during development

## Production Web Deployment

### Prerequisites

- Node.js 16+ installed on server
- Web server (nginx/Apache) or Node.js process manager
- SSL certificate (recommended)
- Domain name (optional)

### Option 1: Direct Node.js Deployment

**Using PM2 (Recommended):**

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name budgeting-app

# Configure startup script
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs budgeting-app
```

**Configuration:**
```bash
# Set production port
export PORT=3000

# Or use ecosystem.config.js
module.exports = {
  apps: [{
    name: 'budgeting-app',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Option 2: Behind Reverse Proxy (nginx)

**nginx configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Steps:**
1. Install nginx: `sudo apt install nginx`
2. Copy config to `/etc/nginx/sites-available/budgeting-app`
3. Create symlink: `sudo ln -s /etc/nginx/sites-available/budgeting-app /etc/nginx/sites-enabled/`
4. Test config: `sudo nginx -t`
5. Reload nginx: `sudo systemctl reload nginx`

### Option 3: Static File Hosting

For pure static hosting (without Express):

1. Build static files (if needed)
2. Copy `public/` directory contents to web root
3. Configure server to serve `index.html`
4. Ensure all static assets are accessible

**Apache .htaccess:**
```apache
DirectoryIndex index.html

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 1 hour"
</IfModule>
```

## Docker Deployment

### Using Docker

**Build and run:**
```bash
# Build image
docker build -t budgeting-app .

# Run container
docker run -d \
  --name budgeting-app \
  -p 3001:3000 \
  --restart unless-stopped \
  budgeting-app

# View logs
docker logs -f budgeting-app

# Stop container
docker stop budgeting-app

# Remove container
docker rm budgeting-app
```

### Using Docker Compose

**Start services:**
```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

**Production docker-compose.yml:**
```yaml
version: '3'
services:
  budgeting-app:
    build: .
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    volumes:
      - ./logs:/usr/src/app/logs
```

### Docker Deployment Tips

- Use volumes for persistent data
- Set proper resource limits
- Configure health checks
- Use restart policies
- Implement logging

**Example with health check:**
```yaml
services:
  budgeting-app:
    build: .
    ports:
      - "3001:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
```

## Cloudflare Workers Deployment

Deploy to Cloudflare's global edge network for low-latency, worldwide access.

### Prerequisites

- Cloudflare account
- Domain configured in Cloudflare (for custom domain)
- Wrangler CLI installed

### Setup

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Configure wrangler.toml:**
   ```toml
   name = "budgeting-app"
   main = "src/worker.js"
   compatibility_date = "2024-01-01"
   
   [site]
   bucket = "./public"
   
   # Use workers.dev subdomain
   # workers_dev = true
   
   # Or use custom domain
   routes = [
     { pattern = "yourdomain.com", custom_domain = true }
   ]
   ```

4. **Deploy:**
   ```bash
   # Deploy to production
   wrangler deploy
   
   # Deploy to preview
   wrangler deploy --env preview
   ```

### Custom Domain Setup

1. **Add domain to Cloudflare:**
   - Add your domain in Cloudflare dashboard
   - Update nameservers at your registrar

2. **Configure route in wrangler.toml:**
   ```toml
   routes = [
     { pattern = "budget.yourdomain.com", custom_domain = true }
   ]
   ```

3. **Deploy:**
   ```bash
   wrangler deploy
   ```

4. **Verify:**
   - Visit your custom domain
   - Check SSL certificate (automatic)

### Workers Deployment Tips

- **Caching**: Cloudflare automatically caches static assets
- **Performance**: Assets served from nearest edge location
- **SSL**: Free SSL certificate included
- **Limits**: Free tier includes 100,000 requests/day
- **Analytics**: Available in Cloudflare dashboard

### Environment Variables (Workers)

Add to `wrangler.toml`:
```toml
[vars]
ENVIRONMENT = "production"
```

Access in worker:
```javascript
export default {
  async fetch(request, env) {
    const environment = env.ENVIRONMENT;
    // Use environment variable
  }
}
```

## Electron Desktop App

Build native desktop applications for Windows, macOS, and Linux.

### Development

```bash
# Run in development mode
npm run electron

# Or use electron directly
npx electron public/main.js
```

### Building for Distribution

**Windows:**
```bash
npm run dist
```

Output: `dist/budgeting-app-setup-1.0.0.exe` and `.zip`

**macOS:**
```bash
npm run dist
```

Output: `dist/budgeting-app-1.0.0.dmg` and `.zip`

**Linux:**
```bash
npm run dist
```

Output: `dist/budgeting-app-1.0.0.AppImage`

### Build Configuration

Edit `package.json` build section:

```json
{
  "build": {
    "appId": "com.yourcompany.budgetingapp",
    "productName": "Budgeting App",
    "directories": {
      "output": "dist"
    },
    "files": [
      "public/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": ["nsis", "zip"],
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "assets/icon.icns",
      "category": "public.app-category.finance"
    },
    "linux": {
      "target": ["AppImage"],
      "icon": "assets/icon.png",
      "category": "Finance"
    }
  }
}
```

### Code Signing (Optional)

**Windows:**
- Requires code signing certificate
- Set `CSC_LINK` and `CSC_KEY_PASSWORD` environment variables
- Or disable: `cross-env CSC_IDENTITY_AUTO_DISCOVERY=false npm run dist`

**macOS:**
- Requires Apple Developer account
- Configure signing identity in build config
- Use notarization for Gatekeeper

### Distribution

1. **GitHub Releases:**
   - Create release on GitHub
   - Upload built artifacts
   - Write release notes

2. **Auto-updater:**
   - Configure electron-updater
   - Host updates on GitHub or custom server
   - Implement update checks in app

## Environment Configuration

### Environment Variables

**Server (Express):**
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

**Docker:**
- Set in `docker-compose.yml` or `.env` file

**Cloudflare Workers:**
- Set in `wrangler.toml` under `[vars]`

### Configuration Files

**wrangler.toml** - Cloudflare Workers
**package.json** - Build and dependencies
**docker-compose.yml** - Docker services

## Monitoring and Maintenance

### Health Checks

**Express server:**
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

**Docker health check:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Logging

**PM2:**
```bash
pm2 logs budgeting-app
pm2 logs budgeting-app --lines 100
```

**Docker:**
```bash
docker logs -f budgeting-app
docker logs --tail 100 budgeting-app
```

**Cloudflare Workers:**
- View logs in Cloudflare dashboard
- Use `wrangler tail` for real-time logs

### Monitoring Services

Consider using:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry, Rollbar
- **Analytics**: Google Analytics, Plausible
- **Performance**: Lighthouse, WebPageTest

### Backup and Recovery

**Important files to backup:**
- `public/taxBrackets.js` - Tax data
- Configuration files
- User data (if stored server-side)

**Recovery procedure:**
1. Keep git repository up to date
2. Tag releases
3. Document deployment process
4. Test recovery procedure

### Updates and Maintenance

**Regular tasks:**
- Update dependencies: `npm update`
- Security audits: `npm audit`
- Update tax data annually
- Monitor for security patches
- Test after updates

**Deployment checklist:**
- [ ] Update version in package.json
- [ ] Test all features
- [ ] Run security audit
- [ ] Update documentation
- [ ] Create git tag
- [ ] Deploy to staging
- [ ] Verify staging deployment
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Monitor for errors

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or use different port
PORT=3001 npm start
```

**Docker build fails:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t budgeting-app .
```

**Cloudflare Workers fails to deploy:**
```bash
# Check wrangler.toml syntax
# Verify authentication
wrangler whoami

# Check logs
wrangler tail
```

## Support

For deployment issues:
- Check application logs
- Review configuration files
- Consult platform documentation
- Open GitHub issue with details

---

**Need help?** Open an issue with:
- Deployment method
- Error messages
- Configuration files
- Steps already tried
