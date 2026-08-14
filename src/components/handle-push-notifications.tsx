import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { APP_CONSTANTS } from '@/constants/app-constants';
import {
  ensureNotificationPermission,
  requestFcmRegistrationToken,
  subscribeForegroundMessages,
} from '@/lib/firebase-messaging';
import { updateUserFcmToken } from '@/services/fcmTokenService';

const PUSH_SW_PATH = '/firebase-messaging-sw.js';

function hasStoredPushPermissionGranted(): boolean {
  try {
    return localStorage.getItem(APP_CONSTANTS.PUSH_NOTIFICATIONS_GRANTED_KEY) === '1';
  } catch {
    return false;
  }
}

function persistPushPermissionGranted(): void {
  try {
    localStorage.setItem(APP_CONSTANTS.PUSH_NOTIFICATIONS_GRANTED_KEY, '1');
  } catch {
    // ignore quota / private mode
  }
}

function shouldPromptForNotifications(): boolean {
  if (typeof Notification === 'undefined') {
    return false;
  }
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return false;
  }
  return !hasStoredPushPermissionGranted();
}

/**
 * Requests notification permission once, registers FCM token, and routes assignment taps.
 */
export function HandlePushNotifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    if (Notification.permission === 'granted') {
      persistPushPermissionGranted();
      void registerPush();
      return;
    }
    if (shouldPromptForNotifications()) {
      setShowPermissionDialog(true);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;
    void (async () => {
      const stop = await subscribeForegroundMessages((route) => {
        navigate(route);
      });
      if (cancelled) {
        stop?.();
        return;
      }
      unsubscribe = stop;
    })();
    const onSwMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; route?: string } | null;
      if (data?.type !== 'NOTIFICATION_CLICK') {
        return;
      }
      const route =
        typeof data.route === 'string' && data.route.trim() !== ''
          ? data.route.trim()
          : '/clients';
      navigate(route);
    };
    navigator.serviceWorker?.addEventListener('message', onSwMessage);
    return () => {
      cancelled = true;
      unsubscribe?.();
      navigator.serviceWorker?.removeEventListener('message', onSwMessage);
    };
  }, [navigate]);

  async function registerPush(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register(PUSH_SW_PATH);
      }
      const token = await requestFcmRegistrationToken();
      if (token == null) {
        return;
      }
      await updateUserFcmToken(token);
    } catch (err) {
      console.error('FCM registration failed', err);
    }
  }

  const handleAllow = (): void => {
    void grantAndRegisterPush();
  };

  async function grantAndRegisterPush(): Promise<void> {
    const permission = await ensureNotificationPermission();
    setShowPermissionDialog(false);
    if (permission !== 'granted') {
      return;
    }
    persistPushPermissionGranted();
    await registerPush();
  }

  return (
    <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('notifications.permissionTitle')}</DialogTitle>
          <DialogDescription>{t('notifications.permissionBody')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setShowPermissionDialog(false)}>
            {t('notifications.permissionLater')}
          </Button>
          <Button type="button" onClick={handleAllow}>
            {t('notifications.permissionAllow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
