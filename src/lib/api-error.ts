/**
 * Custom error class that preserves HTTP status code from API responses.
 * Used by the global QueryClient error handler to detect 401 → signOut.
 */
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code: string = 'UNKNOWN') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
