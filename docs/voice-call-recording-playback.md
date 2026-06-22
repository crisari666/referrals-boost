# Voice call recording playback (referrals-boost)

Play completed Twilio call recordings in the browser by fetching decrypted WAV audio from **quantum-voice-server** as base64 JSON.

## Prerequisites

- `VITE_URL_VOIP_SERVER` set (e.g. `https://your-host/voip`) — same base as VoIP token requests.
- A **Twilio Call SID** (`callId`, format `CA` + 32 hex chars) from your call log, CRM, or UI state. This is the same `callSid` sent to CRM in voice events.
- Recording was started when the call reached `in-progress` (server-side `triggerRecording`).
- Recording status is `completed` on Twilio (may take a few seconds after hang-up).

## API contract

| Item | Value |
|------|--------|
| Method | `GET` |
| Path | `{VITE_URL_VOIP_SERVER}/calls/{callId}/recording` |
| Path param | `callId` — Twilio Call SID (`CA…`) |

### Success (200)

```json
{
  "message": "success",
  "result": {
    "callSid": "CAxxxxxxxx",
    "recordingSid": "RExxxxxxxx",
    "contentType": "audio/wav",
    "audioBase64": "<base64-encoded WAV>",
    "durationSeconds": 32
  }
}
```

### Errors

| Status | Meaning |
|--------|---------|
| 400 | Invalid Call SID format |
| 404 | No completed recording for this call (or fetch failed) |
| 500 | Server/decrypt failure |

### Example

```bash
curl -s "https://your-host/voip/calls/CAxxxxxxxx/recording" \
  -H "ngrok-skip-browser-warning: 69420"
```

## Service (`voipCallRecordingService.ts`)

Mirror [`src/services/voipTokenService.ts`](../src/services/voipTokenService.ts):

```ts
import axios from 'axios';
import i18n from '@/i18n';

export type CallRecordingResult = {
  callSid: string;
  recordingSid: string;
  contentType: 'audio/wav';
  audioBase64: string;
  durationSeconds?: number;
};

export type CallRecordingApiResponse = {
  message: string;
  result: CallRecordingResult;
};

function resolveVoipBaseUrl(): string {
  const raw = import.meta.env.VITE_URL_VOIP_SERVER?.trim() ?? '';
  if (!raw) {
    throw new Error(i18n.t('twilio.missingVoipEnv'));
  }
  return raw.replace(/\/$/, '');
}

export async function fetchCallRecording(callId: string): Promise<CallRecordingResult> {
  const base = resolveVoipBaseUrl();
  const url = `${base}/calls/${encodeURIComponent(callId)}/recording`;
  const { data } = await axios.get<CallRecordingApiResponse>(url, {
    headers: { 'ngrok-skip-browser-warning': '69420' },
  });
  if (!data?.result?.audioBase64) {
    throw new Error(i18n.t('twilio.recordingFetchFailed'));
  }
  return data.result;
}
```

## Using your call ID

Pass the Call SID you already store (CRM `callSid` on voice call logs). **No Voice SDK changes are required.**

Wire from a call-log row or detail:

```ts
const recording = await fetchCallRecording(callId);
```

## Polling after hang-up

If the user opens playback immediately after the call ends, Twilio may not have `completed` the recording yet. Retry every 2–3 seconds for up to 60–90 seconds:

```ts
async function fetchCallRecordingWithRetry(
  callId: string,
  options?: { maxAttempts?: number; intervalMs?: number },
): Promise<CallRecordingResult> {
  const maxAttempts = options?.maxAttempts ?? 30;
  const intervalMs = options?.intervalMs ?? 2500;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fetchCallRecording(callId);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status !== 404 || attempt === maxAttempts - 1) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  throw new Error(i18n.t('twilio.recordingNotReady'));
}
```

## Playback in React

### Data URL (simple, good for short calls)

```tsx
function CallRecordingPlayer({ callId }: { callId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCallRecordingWithRetry(callId)
      .then((r) => {
        if (!cancelled) {
          setSrc(`data:${r.contentType};base64,${r.audioBase64}`);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Playback failed');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [callId]);

  if (loading) return <p>Loading recording…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!src) return null;
  return <audio controls src={src} className="w-full" />;
}
```

### Blob URL (optional, better for large files)

```ts
const bytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
const blob = new Blob([bytes], { type: contentType });
const objectUrl = URL.createObjectURL(blob);
// <audio src={objectUrl} />
// cleanup: URL.revokeObjectURL(objectUrl)
```

## UX integration

- Add **Play recording** on customer call-log list/detail when `callSid` is present.
- Show loading state while polling; disable button during fetch.
- CRM `recordingUrl` in transcription payloads is Twilio metadata only — **playback still goes through the VoIP server** so credentials and decryption stay server-side.

## i18n (suggested keys in `src/i18n/segments/twilio.ts`)

| Key | EN example |
|-----|------------|
| `recordingFetchFailed` | Could not load call recording |
| `recordingNotReady` | Recording is not ready yet. Try again shortly. |
| `recordingLoading` | Loading recording… |

## Limits and security

- Base64 adds ~33% size vs raw bytes; long calls produce large JSON responses.
- v1 endpoint is **open** (same as VoIP token routes). Anyone with a `callId` can request audio. For production, prefer a CRM proxy that validates the agent session and calls the voice server server-to-server.
- Do not log `audioBase64` in analytics or error reports.

## Related server code

- Endpoint: `GET /voip/calls/:callId/recording` in `quantum-voice-server`
- Media fetch/decrypt: `RecordingMediaService`
- Transcription webhook (unchanged): `POST /voip/calls/recording-status-callback`
