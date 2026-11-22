import { apiBaseUrl, REQUEST_TIMEOUT_MS } from './config';

export class ApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
};

/**
 * Ch 9: HTTP JSON off the UI thread via fetch + AbortController.
 * Never treat a non-OK response as success JSON.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = `${apiBaseUrl()}${path}`;

  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const raw = await response.text();
    if (!response.ok) {
      throw new ApiError(raw || `Server error ${response.status}`, response.status);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new ApiError('Server did not return JSON.');
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new ApiError('Could not read the server JSON.');
    }
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('The server did not answer in 10 seconds.');
    }
    throw new ApiError('Cannot reach the planner server. Using the plan already on this phone.');
  } finally {
    clearTimeout(timer);
  }
}
