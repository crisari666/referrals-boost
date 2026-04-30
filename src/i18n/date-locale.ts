import { enUS, es } from "date-fns/locale";
import type { Locale } from "date-fns";
import i18n from "i18next";

/**
 * Returns date-fns locale matching current i18n language.
 */
export function getDateFnsLocale(): Locale {
  const lng = i18n.language ?? "es";
  return lng.startsWith("en") ? enUS : es;
}
