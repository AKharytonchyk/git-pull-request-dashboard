# Dynamic GitHub Environment Deployment Guide

This guide explains how to deploy the GitHub PR Dashboard with OAuth login and dynamic environment configuration for GitHub.com, GitHub Enterprise Server, and GHE.com data-residency tenants.

## Environment Configuration

### Basic Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure OAuth runtime values:**

   **For GitHub.com:**
   ```env
   APP_BASE_URL=https://pullrequests.example.com
   SESSION_SECRET=replace-with-openssl-rand-hex-32
   GITHUB_OAUTH_CLIENT_ID=your-client-id
   GITHUB_OAUTH_CLIENT_SECRET=your-client-secret
   ```

   **For GHE.com, such as pinkroccade.ghe.com:**
   ```env
   APP_BASE_URL=https://pullrequests.example.com
   SESSION_SECRET=replace-with-openssl-rand-hex-32
   GHE_OAUTH_APPS={"pinkroccade.ghe.com":{"clientId":"your-client-id","clientSecret":"your-client-secret","apiUrl":"https://api.pinkroccade.ghe.com","webUrl":"https://pinkroccade.ghe.com"}}
   ```

   **For GitHub Enterprise Server:**
   ```env
   APP_BASE_URL=https://pullrequests.example.com
   SESSION_SECRET=replace-with-openssl-rand-hex-32
   GHE_HOST=ghe.acme.com
   GHE_OAUTH_CLIENT_ID=your-client-id
   GHE_OAUTH_CLIENT_SECRET=your-client-secret
   ```

3. **Register callback URLs in each OAuth App:**

   ```text
   https://pullrequests.example.com/api/auth/github/callback
   ```

### Auto-Detection Features

The application automatically detects and configures:

1. **OAuth provider URLs** - Derived from the selected login host
2. **GHE.com API URLs** - `SUBDOMAIN.ghe.com` maps to `api.SUBDOMAIN.ghe.com`
3. **Content Security Policy** - Generated dynamically based on your GitHub environment

## Runtime Deployment

OAuth login requires the Node runtime from `server/index.mjs`. The Docker image in this repository runs that server on port `8080`, serves the built Vite app, handles OAuth callbacks, stores encrypted HttpOnly cookies, and proxies GitHub API calls through `/api/github/*`.

Static hosting can still be used for PAT-only deployments, but it cannot safely complete the OAuth code exchange because the OAuth client secret must remain server-side.

## Content Security Policy (CSP) Configuration

### Automatic CSP Generation

The application generates CSP headers automatically based on your environment:

```javascript
import { envConfig } from './src/utils/environmentConfig';

// Get dynamic CSP for current environment
const csp = envConfig.generateCSP();
console.log('CSP:', csp);

// Get GitHub domains for whitelisting
const domains = envConfig.getGitHubDomains();
console.log('Domains:', domains);
```

### Production Deployment Examples

#### 1. Built-in Node Runtime

```bash
npm run build
APP_BASE_URL=https://pullrequests.example.com \
SESSION_SECRET="$(openssl rand -hex 32)" \
GITHUB_OAUTH_CLIENT_ID=... \
GITHUB_OAUTH_CLIENT_SECRET=... \
npm run serve
```

#### 2. Nginx Configuration for PAT-only Static Hosting

```nginx
# nginx.conf or site configuration
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    
    # Dynamic CSP header (replace with actual generated value)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://ghe.acme.com/api/v3 https://ghe.acme.com https://api.github.com https://*.ghe.com https://api.simplesvg.com; img-src 'self' data: https://avatars.ghe.acme.com https://avatars.githubusercontent.com https://*.ghe.com https://*.githubusercontent.com https://api.simplesvg.com; frame-ancestors 'none'; base-uri 'self'";
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. GitHub Pages with _headers (Netlify/Cloudflare)

```
# _headers file for static deployments
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://*.ghe.com https://api.simplesvg.com; img-src 'self' data: https://avatars.githubusercontent.com https://*.ghe.com https://*.githubusercontent.com https://api.simplesvg.com; frame-ancestors 'none'; base-uri 'self'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
```

#### 4. Vite Development Server

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dynamic-csp',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Import environment config dynamically
          import('./src/utils/environmentConfig').then(({ envConfig }) => {
            res.setHeader('Content-Security-Policy', envConfig.generateCSP());
            next();
          });
        });
      }
    }
  ]
});
```

## Deployment Scenarios

### Scenario 1: GitHub.com Deployment

**Environment Variables:**
```env
VITE_GITHUB_API_URL=https://api.github.com
```

**Generated CSP:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://*.ghe.com https://api.simplesvg.com; img-src 'self' data: https://avatars.githubusercontent.com https://*.ghe.com https://*.githubusercontent.com https://api.simplesvg.com; frame-ancestors 'none'; base-uri 'self'
```

**Domains to Whitelist:**
- `api.github.com`
- `avatars.githubusercontent.com`
- `github.com`

### Scenario 2: ACME GitHub Enterprise

**Environment Variables:**
```env
VITE_GITHUB_API_URL=https://ghe.acme.com/api/v3
VITE_GITHUB_AVATAR_URL=https://avatars.ghe.acme.com
VITE_GITHUB_BASE_URL=https://ghe.acme.com
```

**Generated CSP:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://ghe.acme.com/api/v3 https://ghe.acme.com https://api.github.com https://*.ghe.com https://api.simplesvg.com; img-src 'self' data: https://avatars.ghe.acme.com https://avatars.githubusercontent.com https://*.ghe.com https://*.githubusercontent.com https://api.simplesvg.com; frame-ancestors 'none'; base-uri 'self'
```

**Domains to Whitelist:**
- `ghe.acme.com`
- `avatars.ghe.acme.com`

### Scenario 3: Generic GitHub Enterprise

**Environment Variables:**
```env
VITE_GITHUB_API_URL=https://github.company.com/api/v3
```

**Auto-Generated Configuration:**
- Avatar URL: `https://avatars.github.company.com`
- Base URL: `https://github.company.com`

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Domain Validation**: All URLs are validated during startup
3. **CSP Enforcement**: CSP headers prevent XSS attacks
4. **Token Security**: OAuth sessions use encrypted HttpOnly cookies; PAT fallback uses sessionStorage with expiration

## Testing Your Configuration

Use these commands to test your environment configuration:

```bash
# Check type compilation
npm run type-check

# Test build with your environment
npm run build

# Start development server
npm start
```

## Troubleshooting

### Common Issues

1. **Avatar Images Not Loading**
   - Check `VITE_GITHUB_AVATAR_URL` configuration
   - Verify CSP `img-src` directive includes your avatar domain

2. **API Requests Failing**
   - Verify `VITE_GITHUB_API_URL` is correct
   - Check CSP `connect-src` directive includes your API domain

3. **CSP Violations**
   - Check browser console for CSP errors
   - Ensure all GitHub domains are included in CSP

### Debug Commands

```javascript
// In browser console, check current configuration:
import('./utils/environmentConfig').then(({ envConfig }) => {
  console.log('Config:', envConfig.getAll());
  console.log('CSP:', envConfig.generateCSP());
  console.log('Domains:', envConfig.getGitHubDomains());
});
```
