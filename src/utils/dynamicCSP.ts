// Dynamic CSP injection for development and production builds
// This script runs before the main application to set up environment-specific CSP

/**
 * Update preconnect links for performance optimization
 * This helps the browser establish connections to GitHub servers early
 */
function updatePreconnectLinks(apiUrl: string, avatarUrl: string): void {
  try {
    // Remove existing preconnect links
    const existingLinks = document.querySelectorAll('link[rel="preconnect"][href*="github"]');
    existingLinks.forEach(link => link.remove());
    
    // Extract hostnames
    const apiHost = new URL(apiUrl).hostname;
    const avatarHost = new URL(avatarUrl).hostname;
    
    // Add preconnect for API host
    if (apiHost !== location.hostname) {
      const apiPreconnect = document.createElement('link');
      apiPreconnect.rel = 'preconnect';
      apiPreconnect.href = `https://${apiHost}`;
      apiPreconnect.crossOrigin = 'anonymous';
      document.head.appendChild(apiPreconnect);
    }
    
    // Add preconnect for avatar host (if different from API host)
    if (avatarHost !== apiHost && avatarHost !== location.hostname) {
      const avatarPreconnect = document.createElement('link');
      avatarPreconnect.rel = 'preconnect';
      avatarPreconnect.href = `https://${avatarHost}`;
      avatarPreconnect.crossOrigin = 'anonymous';
      document.head.appendChild(avatarPreconnect);
    }
    
    if (import.meta.env.DEV) {
      console.log('🔗 Preconnect links updated for:', apiHost, avatarHost);
    }
  } catch (error) {
    console.warn('⚠️ Failed to update preconnect links:', error);
  }
}

/**
 * Dynamically inject CSP based on environment configuration
 * This runs early in the application lifecycle to set up security headers
 */
function injectDynamicCSP(): void {
  try {
    // Get environment variables (available at build time)
    const apiUrl = import.meta.env.VITE_GITHUB_API_URL || 'https://api.github.com';
    const avatarUrl = import.meta.env.VITE_GITHUB_AVATAR_URL || getDefaultAvatarUrl(apiUrl);
    
    // Generate dynamic CSP
    const csp = generateDynamicCSP(apiUrl, avatarUrl);
    
    // Remove existing CSP meta tag if present
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) {
      existingCSP.remove();
    }
    
    // Inject new CSP
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
    metaTag.setAttribute('content', csp);
    document.head.appendChild(metaTag);
     // Also update preconnect links for performance
    updatePreconnectLinks(apiUrl, avatarUrl);

    if (import.meta.env.DEV) {
      console.log('🛡️ Dynamic CSP injected for:', new URL(apiUrl).hostname);
      console.log('🔗 CSP:', csp);
    }

  } catch (error) {
    console.warn('⚠️ Failed to inject dynamic CSP, using GitHub.com default:', error);
    
    // Fallback to GitHub.com CSP
    const fallbackCSP = generateDynamicCSP('https://api.github.com', 'https://avatars.githubusercontent.com');
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
    metaTag.setAttribute('content', fallbackCSP);
    document.head.appendChild(metaTag);
    
    // Also update preconnect links for fallback
    updatePreconnectLinks('https://api.github.com', 'https://avatars.githubusercontent.com');
  }
}

/**
 * Generate CSP based on GitHub API URL and avatar URL
 */
function generateDynamicCSP(apiUrl: string, avatarUrl: string): string {
  const apiHost = new URL(apiUrl).hostname;
  const avatarHost = new URL(avatarUrl).hostname;
  
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' ${apiUrl} https://${apiHost}`,
    `img-src 'self' data: ${avatarUrl} https://${avatarHost}`,
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ].join('; ');
}

/**
 * Get default avatar URL from API URL
 */
function getDefaultAvatarUrl(apiUrl: string): string {
  if (apiUrl === 'https://api.github.com') {
    return 'https://avatars.githubusercontent.com';
  }
  
  try {
    const url = new URL(apiUrl);
    const hostname = url.hostname;
    
    if (hostname.startsWith('ghe.') || hostname.includes('.ghe.')) {
      return `https://avatars.${hostname}`;
    } else {
      return `https://avatars.${hostname}`;
    }
  } catch {
    return 'https://avatars.githubusercontent.com';
  }
}

// Run CSP injection immediately
injectDynamicCSP();
