import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background px-4 py-10 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <main className="mx-auto w-full max-w-2xl space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-3xl font-extrabold text-foreground">
            La<span className="text-primary">Ceiba</span>
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("privacy.title")}
          </h1>
          <p className="text-xs text-muted-foreground">{t("privacy.updated")}</p>
        </header>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("privacy.intro")}
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("privacy.whoTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("privacy.whoBody")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("privacy.dataTitle")}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>{t("privacy.dataCrm")}</li>
            <li>{t("privacy.dataGoogle")}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("privacy.purposeTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("privacy.purposeBody")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("privacy.googleLimitedTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("privacy.googleLimitedBody")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("privacy.storageTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("privacy.storageBody")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("privacy.sharingTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("privacy.sharingBody")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("privacy.rightsTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("privacy.rightsBody")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {t("privacy.contactTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("privacy.contactBody")}
          </p>
        </section>

        <div className="flex justify-center pt-2">
          <Button asChild variant="outline">
            <Link to="/app-info">{t("privacy.appInfoLink")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
