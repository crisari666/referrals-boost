import { Device, type Call } from '@twilio/voice-sdk';

import i18n from '@/i18n';
import type { TwilioCallPhase } from '@/types/twilio-voice';

let device: Device | null = null;
let activeCall: Call | null = null;

export type TwilioVoiceListeners = {
  onDeviceRegistered?: () => void;
  onDeviceError?: (message: string) => void;
  onCallPhase?: (phase: TwilioCallPhase) => void;
  onCallError?: (message: string) => void;
  onCallSid?: (callSid: string | null) => void;
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

/** Applies mute and returns the resulting muted state, or `null` if no active call. */
export function setActiveCallMuted(muted: boolean): boolean | null {
  if (!activeCall) return null;
  try {
    activeCall.mute(muted);
    return activeCall.isMuted();
  } catch {
    return null;
  }
}

export function isActiveCallMuted(): boolean {
  if (!activeCall) return false;
  try {
    return activeCall.isMuted();
  } catch {
    return false;
  }
}

export async function connectOutboundCall(options: {
  to: string;
  callerId: string;
  userId: string;
  customerId: string;
}): Promise<void> {
  if (!device) {
    throw new Error(i18n.t('twilio.voipPhoneNotReady'));
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
  const publishCallSid = (): void => {
    const sid =
      call.parameters?.CallSid ??
      (call as unknown as { outboundConnectionId?: string }).outboundConnectionId ??
      null;
    if (typeof sid === 'string' && sid.length > 0) {
      listeners.onCallSid?.(sid);
    }
  };
  publishCallSid();
  call.on('ringing', () => {
    publishCallSid();
    listeners.onCallPhase?.('ringing');
  });
  call.on('accept', () => {
    publishCallSid();
    listeners.onCallPhase?.('open');
  });
  call.on('disconnect', () => {
    listeners.onCallPhase?.('closed');
    listeners.onCallSid?.(null);
    activeCall = null;
  });
  call.on('cancel', () => {
    listeners.onCallPhase?.('closed');
    listeners.onCallSid?.(null);
    activeCall = null;
  });
  call.on('reject', () => {
    listeners.onCallPhase?.('closed');
    listeners.onCallSid?.(null);
    activeCall = null;
  });
  call.on('error', (err) => {
    listeners.onCallError?.(err.message ?? 'Error en la llamada');
    listeners.onCallPhase?.('error');
    listeners.onCallSid?.(null);
    activeCall = null;
  });
}
