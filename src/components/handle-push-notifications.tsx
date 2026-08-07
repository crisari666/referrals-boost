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
import {
  requestFcmRegistrationToken,
  subscribeForegroundMessages,
} from '@/lib/firebase-messaging';
import { updateUserFcmToken } from '@/services/fcmTokenService';

const PUSH_SW_PATH = '/firebase-messaging-sw.js';

/**
 * Requests notification permission, registers FCM token, and routes assignment taps.
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
      void registerPush();
      return;
    }
    if (Notification.permission === 'default') {
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

  const handleAllow = () => {
    setShowPermissionDialog(false);
    void registerPush();
  };

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
