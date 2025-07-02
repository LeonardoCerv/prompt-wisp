/**
 * Utility functions for web extension integration
 */

/**
 * Check if the current request is from a web extension
 * @param searchParams - URL search parameters
 * @param hasOpener - Whether the window has an opener (popup context)
 * @returns boolean indicating if this is extension mode
 */
export function isExtensionMode(searchParams?: URLSearchParams, hasOpener?: boolean): boolean {
  if (typeof window !== 'undefined') {
    const urlParams = searchParams || new URLSearchParams(window.location.search);
    return urlParams.get('extension') === 'true' || !!window.opener;
  }
  return false;
}

/**
 * Get the appropriate redirect URL based on extension mode
 * @param isExtension - Whether this is extension mode
 * @param defaultUrl - Default URL for non-extension mode
 * @returns The appropriate redirect URL
 */
export function getRedirectUrl(isExtension: boolean, defaultUrl: string = '/prompt'): string {
  return isExtension ? '/extension/success' : defaultUrl;
}

/**
 * Post authentication success message to parent window (for extension integration)
 * @param userData - User data to send
 */
export function postAuthSuccessMessage(userData: any): void {
  if (typeof window !== 'undefined' && window.opener) {
    window.opener.postMessage({
      type: 'PROMPT_WISP_AUTH_SUCCESS',
      userData
    }, '*');
  }
}

/**
 * Store user data in session storage for extension access
 * @param userData - User data to store
 */
export function storeUserDataForExtension(userData: any): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('prompt_wisp_user_data', JSON.stringify({
      authenticated: true,
      user: userData,
      timestamp: Date.now()
    }));
  }
}

/**
 * Clear stored extension data
 */
export function clearExtensionData(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('prompt_wisp_user_data');
  }
}

/**
 * Build URL with extension parameter preserved
 * @param baseUrl - Base URL
 * @param isExtension - Whether to add extension parameter
 * @returns URL with extension parameter if needed
 */
export function buildExtensionUrl(baseUrl: string, isExtension: boolean): string {
  if (!isExtension) return baseUrl;
  
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set('extension', 'true');
  return url.pathname + url.search;
}
