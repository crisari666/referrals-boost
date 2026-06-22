import axios from 'axios';

export function parseNestJsMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const message = (data as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim().length > 0) {
    return message.trim();
  }
  if (Array.isArray(message)) {
    const joined = message.filter(Boolean).map(String).join(', ').trim();
    return joined.length > 0 ? joined : null;
  }
  return null;
}

export function getHttpErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const apiMsg = parseNestJsMessage(err.response?.data);
    if (apiMsg) return apiMsg;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = String((err as { message: string }).message).trim();
    if (msg.length > 0 && !/^Request failed with status code \d+$/i.test(msg)) {
      return msg;
    }
  }
  return fallback;
}

export function mapConflictMessageToField(message: string): string | null {
  const lower = message.toLowerCase();
  if (/tel[eé]fono|phone|n[uú]mero/.test(lower)) return 'phone';
  if (/correo|email/.test(lower)) return 'email';
  if (/documento|document/.test(lower)) return 'document';
  return null;
}

export function buildConflictFieldErrors(message: string): Record<string, string> {
  const field = mapConflictMessageToField(message);
  if (!field) return { _form: message };
  if (field === 'phone') {
    return { phone: message, whatsapp: message };
  }
  return { [field]: message };
}
