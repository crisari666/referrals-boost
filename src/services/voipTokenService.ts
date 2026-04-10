import axios from 'axios';

export type VoipTokenApiResult = {
  tokenJWT: string;
  token: unknown;
};

export type VoipTokenApiResponse = {
  result: VoipTokenApiResult;
  message: string;
};

function resolveVoipBaseUrl(): string {
  const raw = import.meta.env.VITE_URL_VOIP_SERVER?.trim() ?? '';
  if (!raw) {
    throw new Error('Falta VITE_URL_VOIP_SERVER en el entorno');
  }
  return raw.replace(/\/$/, '');
}

export async function fetchVoipAccessToken(identity: string): Promise<VoipTokenApiResult> {
  const base = resolveVoipBaseUrl();
  const url = `${base}/token/create-token/identity/${encodeURIComponent(identity)}`;
  const { data } = await axios.get<VoipTokenApiResponse>(url, {
    headers: {
      'ngrok-skip-browser-warning': '69420',
    },
  });
  if (!data?.result?.tokenJWT) {
    throw new Error('Respuesta de token VoIP inválida');
  }
  return data.result;
}
