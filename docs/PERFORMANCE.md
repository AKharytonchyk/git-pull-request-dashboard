# Performance Optimization Guide

## Overview
This guide outlines performance optimizations implemented and recommended for the GitHub PR Dashboard.

## Code Splitting & Lazy Loading

### Implementation
```typescript
// Components are lazy loaded
const LazyDashboard = lazy(() => import('../pages/Dashboard'));
const LazyIssuesPage = lazy(() => import('../pages/IssuesPage'));
```

### Benefits
- Reduced initial bundle size
- Faster time to first meaningful paint
- Better user experience on slow connections

## React Query Optimization

### Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Benefits
- Intelligent caching reduces API calls
- Background refetching keeps data fresh
- Optimistic updates improve perceived performance

## Rate Limiting

### Current Implementation
- Configurable requests per minute limit
- Queue-based request management
- Exponential backoff for retries
- Priority handling for urgent requests

### Metrics
- Default: 200 requests per minute
- Adjustable via environment variable
- Automatic cleanup of old timestamps

## Bundle Optimization

### Recommendations
1. **Tree Shaking**: Ensure unused code is eliminated
2. **Code Splitting**: Route-based splitting implemented
3. **Compression**: Enable gzip/brotli compression
4. **CDN**: Use CDN for static assets

### Build Analysis
```bash
npm run analyze  # Analyze bundle size
```

## Memory Management

### Best Practices
- AbortController for cancelled requests
- Cleanup intervals in rate limiter
- Proper useEffect cleanup
- Intersection Observer for conditional loading

### Memory Leaks Prevention
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  fetchData({ signal: controller.signal });
  
  return () => controller.abort();
}, []);
```

## Virtualization

### For Large Lists
When displaying many PRs/issues, consider implementing:

```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={100}
  >
    {({ index, style }) => (
      <div style={style}>
        <PullRequestCard pr={items[index]} />
      </div>
    )}
  </List>
);
```

## Image Optimization

### Avatar Loading
- Use appropriate image sizes
- Implement lazy loading for avatars
- Consider WebP format support
- Add loading states

## Network Optimization

### API Calls
- Batch related requests
- Use proper caching headers
- Implement request deduplication
- Optimize payload sizes

### Preloading
```html
<link rel="preconnect" href="https://api.github.com" />
<link rel="preconnect" href="https://avatars.githubusercontent.com" />
```

## Performance Monitoring

### Metrics to Track
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

### Tools
- React DevTools Profiler
- Chrome Lighthouse
- Web Vitals extension
- Bundle analyzer

## Performance Budget

### Targets
- Bundle size: < 1MB compressed
- First load: < 3 seconds
- Subsequent loads: < 1 second
- API response time: < 500ms

### Monitoring
```bash
npm run build           # Build and check sizes
npm run analyze         # Analyze bundle
```

## Optimization Checklist

### Code Level
- [ ] Implement React.memo for expensive components
- [ ] Use useMemo for expensive calculations
- [ ] Implement useCallback for stable references
- [ ] Lazy load non-critical components
- [ ] Optimize re-renders with proper dependencies

### Network Level
- [ ] Enable HTTP/2
- [ ] Use compression (gzip/brotli)
- [ ] Implement proper caching strategies
- [ ] Optimize API payload sizes
- [ ] Use CDN for static assets

### Bundle Level
- [ ] Code splitting implemented
- [ ] Tree shaking enabled
- [ ] Dead code elimination
- [ ] Proper source maps for debugging
- [ ] Bundle size monitoring

## Performance Testing

### Load Testing
- Test with large datasets (1000+ PRs)
- Simulate slow network conditions
- Test on low-end devices
- Monitor memory usage over time

### Benchmarking
```typescript
// Performance measurement
const startTime = performance.now();
await fetchData();
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);
```
