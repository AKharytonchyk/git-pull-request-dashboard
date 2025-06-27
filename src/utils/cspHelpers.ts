// Example: Dynamic CSP Generation for Production Deployment
// This file demonstrates how to use the dynamic CSP generation for various deployment scenarios

import { envConfig } from '../utils/environmentConfig';

/**
 * Generate Content Security Policy meta tag for HTML insertion
 * Useful for server-side rendering or static site generation
 */
export function generateCSPMetaTag(): string {
  const csp = envConfig.generateCSP();
  return `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
}

/**
 * Generate CSP header for server configuration
 * Useful for Express.js, nginx, or other web server configurations
 */
export function generateCSPHeader(): { name: string; value: string } {
  return {
    name: 'Content-Security-Policy',
    value: envConfig.generateCSP()
  };
}

/**
 * Get GitHub domains for whitelist configuration
 * Useful for firewall or proxy configurations
 */
export function getGitHubDomainsForWhitelist(): string[] {
  const domains = envConfig.getGitHubDomains();
  return [
    domains.api,
    domains.avatars,
    domains.base
  ];
}

/**
 * Example usage in different deployment scenarios
 */
export const deploymentExamples = {
  
  // Express.js middleware
  expressMiddleware: `
app.use((req, res, next) => {
  const { name, value } = generateCSPHeader();
  res.setHeader(name, value);
  next();
});`,

  // Nginx configuration
  nginxConfig: `
# Add to nginx.conf or site configuration
add_header Content-Security-Policy "${envConfig.generateCSP()}";`,

  // Vite plugin configuration
  vitePlugin: `
// vite.config.ts
export default defineConfig({
  plugins: [
    {
      name: 'csp-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const { name, value } = generateCSPHeader();
          res.setHeader(name, value);
          next();
        });
      }
    }
  ]
});`,

  // HTML meta tag injection
  htmlInjection: `
// For static deployments, inject CSP meta tag
document.head.insertAdjacentHTML('beforeend', generateCSPMetaTag());`,

  // GitHub Pages deployment with CSP
  githubPagesCSP: `
# For GitHub Pages, CSP can be set via _headers file (Netlify) or similar
/*
  Content-Security-Policy: ${envConfig.generateCSP()}`

};

// Environment-specific configurations
export const environmentConfigs = {
  
  // GitHub.com configuration
  githubCom: {
    apiUrl: 'https://api.github.com',
    avatarUrl: 'https://avatars.githubusercontent.com',
    baseUrl: 'https://github.com',
    expectedCSP: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.github.com https://api.github.com",
      "img-src 'self' data: https://avatars.githubusercontent.com https://avatars.githubusercontent.com",
      "frame-ancestors 'none'",
      "base-uri 'self'"
    ].join('; ')
  },

  // ACME GitHub Enterprise
  acmeEnterprise: {
    apiUrl: 'https://ghe.acme.com/api/v3',
    avatarUrl: 'https://avatars.ghe.acme.com',
    baseUrl: 'https://ghe.acme.com',
    expectedCSP: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://ghe.acme.com/api/v3 https://ghe.acme.com",
      "img-src 'self' data: https://avatars.ghe.acme.com https://avatars.ghe.acme.com",
      "frame-ancestors 'none'",
      "base-uri 'self'"
    ].join('; ')
  },

  // Generic GitHub Enterprise
  genericEnterprise: {
    apiUrl: 'https://github.company.com/api/v3',
    avatarUrl: 'https://avatars.github.company.com',
    baseUrl: 'https://github.company.com',
    expectedCSP: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://github.company.com/api/v3 https://github.company.com",
      "img-src 'self' data: https://avatars.github.company.com https://avatars.github.company.com",
      "frame-ancestors 'none'",
      "base-uri 'self'"
    ].join('; ')
  }
};
