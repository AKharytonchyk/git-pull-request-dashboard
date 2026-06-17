# Security Guidelines

This document outlines the security measures implemented in the GitHub PR Dashboard and best practices for users.

## Authentication Security

### OAuth Sessions
- **Server-side exchange**: OAuth authorization codes are exchanged by the Node runtime so client secrets never enter the browser bundle
- **HttpOnly Cookies**: OAuth sessions are stored in encrypted HttpOnly cookies
- **Same-Origin Proxy**: GitHub API requests are proxied through `/api/github/*`, where the runtime injects the signed-in user's OAuth token
- **Automatic Expiration**: Sessions expire after 8 hours by default
- **Secure Cleanup**: Session cookies are cleared on logout or expiration

### PAT Fallback Storage
- **Session Storage**: PAT fallback tokens are stored in `sessionStorage` instead of `localStorage`
- **Base64 Encoding**: PAT fallback tokens are encoded before storage to prevent casual inspection
- **Automatic Expiration**: PAT fallback sessions automatically expire after 8 hours of inactivity
- **Secure Cleanup**: PAT fallback tokens are automatically cleared on logout or expiration

### Token Validation
- **GitHub API Validation**: OAuth and PAT sessions are verified against GitHub's API during authentication
- **Error Handling**: Failed authentications are handled gracefully with user feedback

### Best Practices for Users

#### OAuth App Management
1. **Exact Callback URL**: Register `https://YOUR_APP_HOST/api/auth/github/callback`
2. **Stable Session Secret**: Set `SESSION_SECRET` in every production deployment
3. **Scope Limitation**: Only request scopes the dashboard needs, usually `repo`, `read:org`, `user:email`, and optionally `security_events`
4. **Enterprise Mapping**: For GHE.com tenants, map the web host to `https://api.SUBDOMAIN.ghe.com`

#### Usage Guidelines
1. **Private Browsing**: Consider using private/incognito mode for additional security
2. **Logout**: Always logout when finished, especially on shared computers
3. **Network Security**: Use HTTPS and secure networks when accessing the dashboard
4. **Monitor Usage**: Regularly check your GitHub token usage and access logs

## Application Security Features

### Rate Limiting
- **GitHub API Protection**: Built-in rate limiting prevents API abuse
- **Exponential Backoff**: Automatic retry with exponential backoff on rate limit hits
- **Queue Management**: Request queuing to maintain API limits

### Error Handling
- **Secure Error Messages**: Error messages don't expose sensitive information
- **Authentication Failures**: Clear feedback on authentication issues without revealing token details
- **Network Errors**: Graceful handling of network connectivity issues

### Content Security Policy (CSP)
The application automatically generates dynamic CSP headers based on your GitHub environment configuration.

**Dynamic CSP Generation:**
```javascript
// The application automatically detects your GitHub environment and generates appropriate CSP
import { envConfig } from './utils/environmentConfig';
const csp = envConfig.generateCSP();
```

**For GitHub.com (default):**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://*.ghe.com https://api.simplesvg.com; img-src 'self' data: https://avatars.githubusercontent.com https://*.ghe.com https://*.githubusercontent.com https://api.simplesvg.com; frame-ancestors 'none'; base-uri 'self'
```

**For GitHub Enterprise Server (e.g., ACME Corporation):**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://ghe.acme.com/api/v3 https://ghe.acme.com https://api.github.com https://*.ghe.com https://api.simplesvg.com; img-src 'self' data: https://avatars.ghe.acme.com https://avatars.githubusercontent.com https://*.ghe.com https://*.githubusercontent.com https://api.simplesvg.com; frame-ancestors 'none'; base-uri 'self'
```

**Environment Configuration:**
Set these environment variables to customize CSP generation:
- `VITE_GITHUB_API_URL` - API endpoint (e.g., `https://ghe.acme.com/api/v3`)
- `VITE_GITHUB_AVATAR_URL` - Avatar endpoint (auto-detected if not set)
- `VITE_GITHUB_BASE_URL` - Base GitHub URL (auto-detected if not set)

### HTTPS Enforcement
- **Production Deployment**: Always deploy with HTTPS in production
- **Secure Cookies**: OAuth session cookies are marked secure when the app is served over HTTPS or `APP_BASE_URL` uses HTTPS
- **HSTS Headers**: Implement HTTP Strict Transport Security headers

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** create a public GitHub issue
2. Email the maintainers directly (if contact info is available)
3. Provide detailed information about the vulnerability
4. Allow reasonable time for response and fix

## Security Checklist for Developers

- [ ] `SESSION_SECRET` is set in production
- [ ] OAuth callback URLs match `APP_BASE_URL`
- [ ] OAuth session cookies are HttpOnly and encrypted
- [ ] PAT fallback storage uses sessionStorage with expiration
- [ ] All API calls include proper error handling
- [ ] Rate limiting is implemented and tested
- [ ] CSP headers are configured
- [ ] HTTPS is enforced in production
- [ ] No sensitive data in console logs
- [ ] Input validation on all user inputs
- [ ] Dependencies are regularly updated
- [ ] Security testing is performed

## Compliance and Standards

This application follows:
- OWASP security guidelines for web applications
- GitHub's API security best practices
- Industry standards for token management
- Secure coding practices for React applications

## Updates

This security document should be reviewed and updated with each major release or security enhancement.
