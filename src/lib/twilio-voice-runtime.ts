import { Device, type Call } from '@twilio/voice-sdk';

import type { TwilioCallPhase } from '@/types/twilio-voice';

let device: Device | null = null;
let activeCall: Call | null = null;

export type TwilioVoiceListeners = {
  onDeviceRegistered?: () => void;
  onDeviceError?: (message: string) => void;
  onCallPhase?: (phase: TwilioCallPhase) => void;
  onCallError?: (message: string) => void;
};

let listeners: TwilioVoiceListeners = {};

export function setTwilioVoiceListeners(next: TwilioVoiceListeners): void {
  listeners = next;
}

export function isTwilioDeviceReady(): boolean {
  return Boolean(device);
}

export async function registerTwilioDevice(tokenJwt: string): Promise<void> {
  await destroyTwilioDevice();
  const d = new Device(tokenJwt, { logLevel: 'error' });
  d.on('registered', () => {
    listeners.onDeviceRegistered?.();
  });
  d.on('error', (err) => {
    listeners.onDeviceError?.(err.message ?? 'Error de Twilio Device');
  });
  d.on('incoming', (call) => {
    call.reject();
  });
  await d.register();
  device = d;
}

export async function destroyTwilioDevice(): Promise<void> {
  if (activeCall) {
    try {
      activeCall.disconnect();
    } catch {
      /* ignore */
    }
    activeCall = null;
  }
  if (device) {
    device.destroy();
    device = null;
  }
}

export function disconnectActiveCall(): void {
  if (activeCall) {
    try {
      activeCall.disconnect();
    } catch {
      /* ignore */
    }
    activeCall = null;
  }
}

export async function connectOutboundCall(options: {
  to: string;
  callerId: string;
  userId: string;
  customerId: string;
}): Promise<void> {
  if (!device) {
    throw new Error('Teléfono VoIP no listo');
  }
  listeners.onCallPhase?.('connecting');
  const call = await device.connect({
    params: {
      To: options.to,
      __TWI_CALLER_ID: options.callerId,
      __TWI_USER_ID: options.userId,
      __TWI_CUSTOMER_ID: options.customerId,
    },
  });
  activeCall = call;
  call.on('ringing', () => {
    listeners.onCallPhase?.('ringing');
  });
  call.on('accept', () => {
    listeners.onCallPhase?.('open');
  });
  call.on('disconnect', () => {
    listeners.onCallPhase?.('closed');
    activeCall = null;
  });
  call.on('cancel', () => {
    listeners.onCallPhase?.('closed');
    activeCall = null;
  });
  call.on('reject', () => {
    listeners.onCallPhase?.('closed');
    activeCall = null;
  });
  call.on('error', (err) => {
    listeners.onCallError?.(err.message ?? 'Error en la llamada');
    listeners.onCallPhase?.('error');
    activeCall = null;
  });
}
