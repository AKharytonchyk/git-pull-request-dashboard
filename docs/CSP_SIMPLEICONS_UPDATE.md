# Content Security Policy (CSP) Update for SimpleIcons

## Overview
The GitHub PR Dashboard uses SimpleIcons (via @iconify/react) to display technology icons for repository languages. This requires updating the Content Security Policy to allow connections to `api.simplesvg.com`.

## Changes Made

### 1. Dynamic CSP Configuration

Updated `src/utils/dynamicCSP.ts` to include SimpleIcons API:

```typescript
// Before
connect-src 'self' ${apiUrl} https://${apiHost}
img-src 'self' data: ${avatarUrl} https://${avatarHost}

// After  
connect-src 'self' ${apiUrl} https://${apiHost} https://api.simplesvg.com
img-src 'self' data: ${avatarUrl} https://${avatarHost} https://api.simplesvg.com
```

### 2. Environment Configuration

Updated `src/utils/environmentConfig.ts` to include SimpleIcons API:

```typescript
// Before
connect-src 'self' ${githubApiUrl} https://${apiHost}
img-src 'self' data: ${githubAvatarUrl} https://${avatarHost}

// After
connect-src 'self' ${githubApiUrl} https://${apiHost} https://api.simplesvg.com
img-src 'self' data: ${githubAvatarUrl} https://${avatarHost} https://api.simplesvg.com
```

### 3. Documentation Updates

Updated all CSP examples in:
- `docs/SECURITY.md`
- `docs/DEPLOYMENT.md`
- `index-enhanced.html`

## Final CSP Configuration

### GitHub.com
```
default-src 'self'; 
script-src 'self' 'unsafe-inline'; 
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
font-src 'self' https://fonts.gstatic.com; 
connect-src 'self' https://api.github.com https://api.simplesvg.com; 
img-src 'self' data: https://avatars.githubusercontent.com https://api.simplesvg.com; 
frame-ancestors 'none'; 
base-uri 'self'
```

### GitHub Enterprise
```
default-src 'self'; 
script-src 'self' 'unsafe-inline'; 
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
font-src 'self' https://fonts.gstatic.com; 
connect-src 'self' https://ghe.acme.com/api/v3 https://ghe.acme.com https://api.simplesvg.com; 
img-src 'self' data: https://avatars.ghe.acme.com https://api.simplesvg.com; 
frame-ancestors 'none'; 
base-uri 'self'
```

## Why SimpleIcons?

- **Rich Icon Set**: Provides 2000+ high-quality SVG icons for technologies
- **Consistent Styling**: All icons follow the same design principles
- **Performance**: SVG icons are lightweight and scalable
- **Up-to-date**: Regularly updated with new technologies
- **Free**: Open source and free to use

## Security Considerations

- **Limited Scope**: Only allows connections to `api.simplesvg.com`
- **CDN Trust**: SimpleIcons API is operated by the same team that maintains the icon set
- **No Execution**: Only fetches icon data, no script execution
- **Fallback**: Application gracefully handles icon loading failures

## Testing

The CSP changes have been tested and verified:
- ✅ Type checking passes
- ✅ Build succeeds
- ✅ Icons load correctly
- ✅ No CSP violations in development
- ✅ Fallback handling works

## Alternative Approaches

If you prefer not to use external APIs, you can:

1. **Bundle icons locally**: Download icon sets and serve them from your domain
2. **Use fewer icons**: Only include essential icons in your build
3. **Disable icons**: Remove icon functionality entirely

The current approach balances functionality, performance, and security.
