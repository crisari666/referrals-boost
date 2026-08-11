import { GOOGLE_GIS_SCRIPT_SRC } from "@/lib/google/google-calendar.constants";

const GIS_SCRIPT_ID = "google-identity-services";

let loadPromise: Promise<void> | null = null;

/**
 * Loads the Google Identity Services client script once.
 */
export function loadGisScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Identity Services requires a browser."));
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (loadPromise) {
    return loadPromise;
  }
  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GIS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services.")),
        { once: true },
      );
      return;
    }
    const script = document.createElement("script");
    script.id = GIS_SCRIPT_ID;
    script.src = GOOGLE_GIS_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });
  return loadPromise;
}
