import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

const AppInfoPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background px-4 py-10 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <main className="mx-auto w-full max-w-2xl space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-3xl font-extrabold text-foreground">
            La<span className="text-primary">Ceiba</span>
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("appInfo.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("appInfo.subtitle")}</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t("appInfo.purposeTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("appInfo.purposeBody")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {t("appInfo.googleTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("appInfo.googleIntro")}
          </p>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              {t("appInfo.calendarScopeTitle")}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("appInfo.calendarScopeBody")}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              {t("appInfo.meetScopeTitle")}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("appInfo.meetScopeBody")}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t("appInfo.limitedUseTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("appInfo.limitedUseBody")}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t("appInfo.revokeTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("appInfo.revokeBody")}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t("appInfo.contactTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("appInfo.contactBody")}
          </p>
        </section>

        <div className="flex justify-center pt-2">
          <Button asChild variant="outline">
            <Link to="/login">{t("appInfo.goToLogin")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AppInfoPage;
