import type {
  CreateReceptionPayload,
  CreatedReceptionResponse,
} from '../types/reception-types';

const BASE_URL = '/api/warehouse/receptions';

// TODO: Replace with actual fetch once backend exists.
// For now, this attempts the call and surfaces a clear error
// when the backend is unavailable.

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`[${res.status}] ${res.statusText}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function createReception(
  payload: CreateReceptionPayload,
): Promise<CreatedReceptionResponse> {
  return request<CreatedReceptionResponse>('POST', '', payload);
}
