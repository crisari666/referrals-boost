import i18n from "i18next";

/**
 * BCP 47 tag for Intl / toLocaleString based on current i18n language.
 */
export function getIntlLocaleTag(): string {
  const lng = i18n.language ?? "es";
  return lng.startsWith("en") ? "en-US" : "es-MX";
}
