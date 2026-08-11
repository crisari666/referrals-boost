import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  loginUser,
  loginWithGoogle,
  clearError,
  setError,
} from "@/store/authSlice";
import { ensureGoogleCalendarAndMeetScopesAtLogin } from "@/lib/google/request-calendar-access-token";

const DEFAULT_LAT = 40;
const DEFAULT_LNG = 40;

export function useLoginPage() {
  const { t } = useTranslation();
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);
  const scopesEnsuredForLoginRef = useRef(false);
  const wasAuthenticatedOnMountRef = useRef(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const alreadyWasIn = wasAuthenticatedOnMountRef.current;
    if (alreadyWasIn) {
      navigate("/", { replace: true });
      return;
    }
    if (scopesEnsuredForLoginRef.current) {
      return;
    }
    scopesEnsuredForLoginRef.current = true;
    void (async () => {
      try {
        await ensureGoogleCalendarAndMeetScopesAtLogin();
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : t("auth.googleScopesAtLoginFailed");
        toast.error(message);
      } finally {
        navigate("/", { replace: true });
      }
    })();
  }, [isAuthenticated, navigate, t]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const value = userOrEmail.trim();
      dispatch(
        loginUser({
          user: value,
          email: value,
          password,
          lat: coords.lat,
          lng: coords.lng,
        })
      );
    },
    [dispatch, userOrEmail, password, coords.lat, coords.lng]
  );

  const handleGoogleCredential = useCallback(
    (idToken: string) => {
      void dispatch(
        loginWithGoogle({
          idToken,
          lat: coords.lat,
          lng: coords.lng,
        }),
      );
    },
    [dispatch, coords.lat, coords.lng],
  );

  const handleGoogleError = useCallback(
    (message: string) => {
      dispatch(setError(message));
    },
    [dispatch],
  );

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    userOrEmail,
    setUserOrEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleSubmit,
    handleGoogleCredential,
    handleGoogleError,
    dismissError,
  };
}
