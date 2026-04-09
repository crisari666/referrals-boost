import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginUser, clearError } from "@/store/authSlice";

const DEFAULT_LAT = 40;
const DEFAULT_LNG = 40;

export function useLoginPage() {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

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
    dismissError,
  };
}
