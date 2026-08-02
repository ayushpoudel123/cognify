// Explicit backend base URL - uses env var with hardcoded fallback
const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '') ||
  'http://localhost:4000';

export { BACKEND_BASE_URL };

/**
 * Converts a relative upload path like "/uploads/file-xxx.jpg"
 * into a full URL: "http://localhost:4000/uploads/file-xxx.jpg"
 */
export function getMediaUrl(path?: string | null): string {
  if (!path) return '';
  // Already a full URL - return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
}
