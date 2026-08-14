import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APPID as string | undefined,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID as string | undefined,
};

function hasFirebaseConfig(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseConfig.messagingSenderId,
  );
}

function getFirebaseApp(): FirebaseApp | null {
  if (!hasFirebaseConfig()) {
    return null;
  }
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  return initializeApp(firebaseConfig);
}

let messagingInstance: Messaging | null = null;

/**
 * Returns Firebase Messaging when supported in this browser, otherwise null.
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (messagingInstance != null) {
    return messagingInstance;
  }
  const supported = await isSupported().catch(() => false);
  if (!supported) {
    return null;
  }
  const app = getFirebaseApp();
  if (app == null) {
    return null;
  }
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

/**
 * Returns the current notification permission without prompting when already decided.
 */
export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') {
    return 'denied';
  }
  if (Notification.permission !== 'default') {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

/**
 * Requests an FCM registration token using the web VAPID key.
 * Does not prompt for permission; call ensureNotificationPermission first.
 */
export async function requestFcmRegistrationToken(): Promise<string | null> {
  const messaging = await getFirebaseMessaging();
  const vapidKey = (import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined)?.trim();
  if (messaging == null || vapidKey == null || vapidKey === '') {
    return null;
  }
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return null;
  }
  const token = await getToken(messaging, { vapidKey });
  return token != null && token.trim() !== '' ? token : null;
}

/**
 * Foreground FCM handler: shows a browser notification and invokes onNavigate on click.
 */
export async function subscribeForegroundMessages(
  onNavigate: (route: string) => void,
): Promise<(() => void) | null> {
  const messaging = await getFirebaseMessaging();
  if (messaging == null) {
    return null;
  }
  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? 'La Ceiba';
    const body = payload.notification?.body ?? '';
    const route =
      typeof payload.data?.route === 'string' && payload.data.route.trim() !== ''
        ? payload.data.route.trim()
        : typeof payload.data?.customerId === 'string' &&
            payload.data.customerId.trim() !== ''
          ? `/clients/${payload.data.customerId.trim()}`
          : '/clients';
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return;
    }
    const notification = new Notification(title, {
      body,
      data: { route },
      icon: '/la-ceiba-icon.png',
    });
    notification.onclick = () => {
      window.focus();
      onNavigate(route);
      notification.close();
    };
  });
}
