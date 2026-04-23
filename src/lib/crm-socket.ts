import { io, type Socket } from 'socket.io-client'

/**
 * Socket.IO expects an HTTP(S) origin; normalizes ws(s):// from env.
 */
export function resolveCrmSocketUrl(): string | null {
  const raw = import.meta.env.VITE_URL_SOCKET?.trim()
  if (!raw) return null
  let url = raw.replace(/\/$/, '')
  if (url.startsWith('ws://')) {
    url = `http://${url.slice('ws://'.length)}`
  } else if (url.startsWith('wss://')) {
    url = `https://${url.slice('wss://'.length)}`
  }
  return url
}

export function getUserIdFromSocketPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const o = payload as Record<string, unknown>
  const id = o._id ?? o.id
  if (typeof id === 'string' && id.length > 0) return id
  return null
}

export function connectCrmSocket(token: string): Socket | null {
  const url = resolveCrmSocketUrl()
  console.log('connectCrmSocketurl', url);
  if (!url) return null
  return io(url, {
    transports: ['websocket'],
    autoConnect: true,
    auth: { token },
  })
}
