import type { ChatRequest, ChatResponse, LeadInput } from '@lawnguy/brand';

const BROWSER_API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? '')
    : (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '');

function endpoint(path: string): string {
  return `${BROWSER_API_BASE}${path}`;
}

export type ApiError = {
  error: string;
  issues?: { fieldErrors: Record<string, string[]> };
};

export async function postLead(
  input: LeadInput,
): Promise<{ ok: true; id: string } | { ok: false; error: ApiError; status: number }> {
  const res = await fetch(endpoint('/api/public/leads'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = (await res.json().catch(() => ({ error: 'NetworkError' }))) as ApiError;
    return { ok: false, error, status: res.status };
  }
  const data = (await res.json()) as { ok: true; id: string };
  return data;
}

export async function postChat(
  body: ChatRequest,
): Promise<{ ok: true; data: ChatResponse } | { ok: false; error: ApiError; status: number }> {
  const res = await fetch(endpoint('/api/public/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = (await res.json().catch(() => ({ error: 'NetworkError' }))) as ApiError;
    return { ok: false, error, status: res.status };
  }
  const data = (await res.json()) as ChatResponse;
  return { ok: true, data };
}
