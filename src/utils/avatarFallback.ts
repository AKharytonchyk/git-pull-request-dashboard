/**
 * Avatar fallback utilities for handling GHE authentication issues
 */

/**
 * Create a fallback avatar URL that handles GHE authentication issues
 * If the original avatar fails to load, fall back to GitHub.com avatar or generic avatar
 */
export function createAvatarWithFallback(originalAvatarUrl: string): string {
  // If it's already a GitHub.com avatar, return as is
  if (originalAvatarUrl.includes('avatars.githubusercontent.com')) {
    return originalAvatarUrl;
  }

  // For GHE avatars that might require auth, we can't easily detect failures
  // So we return the original URL but the CSP now allows GitHub.com as fallback
  return originalAvatarUrl;
}

/**
 * Generate a GitHub.com fallback avatar URL from a username
 */
export function getGitHubAvatarFallback(username: string): string {
  return `https://github.com/${username}.png`;
}

/**
 * Handle avatar loading errors by providing fallbacks
 * This can be used in onError handlers for img elements
 */
export function handleAvatarError(event: Event, username?: string): void {
  const img = event.target as HTMLImageElement;
  
  if (!img.src.includes('github.com') && username) {
    // First fallback: try GitHub.com avatar
    img.src = getGitHubAvatarFallback(username);
  } else {
    // Final fallback: use a generic avatar or hide the image
    img.style.display = 'none';
  }
}

/**
 * Create avatar URL with fallback handling for React components
 */
export function useAvatarWithFallback(avatarUrl: string, username: string) {
  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    
    if (!img.src.includes('github.com')) {
      // First fallback: try GitHub.com avatar
      img.src = getGitHubAvatarFallback(username);
    } else {
      // Final fallback: hide image or use default
      img.style.display = 'none';
    }
  };

  return {
    src: avatarUrl,
    onError: handleError
  };
}
