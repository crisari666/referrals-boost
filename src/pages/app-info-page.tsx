import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

const FEATURE_KEYS = [
  "featureClients",
  "featureProjects",
  "featureSchedule",
  "featureMeet",
  "featureMeetSync",
  "featureComms",
] as const;

const GOOGLE_PURPOSE_KEYS = ["googlePurpose1", "googlePurpose2"] as const;

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
          <p className="text-base font-medium text-foreground">
            {t("appInfo.appName")}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("appInfo.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("appInfo.subtitle")}</p>
        </header>

        <section className="space-y-3" aria-labelledby="app-purpose">
          <h2 id="app-purpose" className="text-lg font-semibold text-foreground">
            {t("appInfo.purposeTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-foreground">
            {t("appInfo.purposeLead")}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("appInfo.purposeBody")}
          </p>
        </section>

        <section className="space-y-3" aria-labelledby="app-features">
          <h2 id="app-features" className="text-lg font-semibold text-foreground">
            {t("appInfo.featuresTitle")}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {FEATURE_KEYS.map((key) => (
              <li key={key}>{t(`appInfo.${key}`)}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4" aria-labelledby="google-data-purpose">
          <h2
            id="google-data-purpose"
            className="text-lg font-semibold text-foreground"
          >
            {t("appInfo.googleTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-foreground">
            {t("appInfo.googleIntro")}
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {GOOGLE_PURPOSE_KEYS.map((key) => (
              <li key={key}>{t(`appInfo.${key}`)}</li>
            ))}
          </ol>
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

        <section className="space-y-3" aria-labelledby="privacy-link">
          <h2 id="privacy-link" className="text-lg font-semibold text-foreground">
            {t("appInfo.privacyTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("appInfo.privacyBody")}{" "}
            <Link
              to="/privacy"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
            >
              {t("appInfo.privacyLink")}
            </Link>
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

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild variant="outline">
            <Link to="/privacy">{t("appInfo.privacyLink")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">{t("appInfo.goToLogin")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AppInfoPage;
