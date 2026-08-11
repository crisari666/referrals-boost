import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { loadGisScript } from "@/lib/google/load-gis-script";
import type { GoogleCredentialResponse } from "@/lib/google/gis-types";

type GoogleSignInButtonProps = {
  disabled?: boolean;
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
};

/**
 * Renders the official GIS "Sign in with Google" button and returns an ID token.
 */
export function GoogleSignInButton({
  disabled = false,
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const { t, i18n } = useTranslation();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    if (disabled) {
      return;
    }
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";
    const host = hostRef.current;
    if (!clientId || !host) {
      onErrorRef.current?.(t("auth.googleClientIdMissing"));
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        await loadGisScript();
        if (cancelled || !hostRef.current) {
          return;
        }
        const accountsId = window.google?.accounts?.id;
        if (!accountsId) {
          onErrorRef.current?.(t("auth.googleSignInUnavailable"));
          return;
        }
        hostRef.current.innerHTML = "";
        accountsId.initialize({
          client_id: clientId,
          callback: (response: GoogleCredentialResponse) => {
            const idToken = response.credential?.trim() ?? "";
            if (!idToken) {
              onErrorRef.current?.(t("auth.googleSignInCancelled"));
              return;
            }
            onCredentialRef.current(idToken);
          },
          auto_select: false,
          ux_mode: "popup",
        });
        const width = Math.min(
          hostRef.current.clientWidth || 320,
          400,
        );
        accountsId.renderButton(hostRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width,
          locale: i18n.language?.startsWith("es") ? "es" : "en",
        });
      } catch {
        if (!cancelled) {
          onErrorRef.current?.(t("auth.googleSignInUnavailable"));
        }
      }
    })();
    return () => {
      cancelled = true;
      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }
    };
  }, [disabled, i18n.language, t]);

  return (
    <div
      ref={hostRef}
      className={`flex w-full justify-center min-h-10 ${disabled ? "pointer-events-none opacity-50" : ""}`}
      aria-label={t("auth.signInWithGoogle")}
    />
  );
}
