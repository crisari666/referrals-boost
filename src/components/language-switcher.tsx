import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppLanguage } from "@/i18n/types";

/**
 * Switches UI language between Spanish and English; persists via i18next detector.
 */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.language?.startsWith("en") ? "en" : "es") as AppLanguage;
  const setLang = (lng: AppLanguage) => {
    void i18n.changeLanguage(lng);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 cursor-pointer border-border text-muted-foreground hover:text-foreground"
          aria-label={t("common.language")}
        >
          <Languages className="h-4 w-4 shrink-0" />
          <span className="text-xs font-medium">{current === "es" ? "ES" : "EN"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setLang("es");
          }}
        >
          {t("common.languageEs")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setLang("en");
          }}
        >
          {t("common.languageEn")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
