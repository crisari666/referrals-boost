import ScheduleDialog from "./ScheduleDialog";
import { useTranslation } from "react-i18next";

interface SchedulePageHeaderProps {
  showScheduleButton: boolean;
}

const SchedulePageHeader = ({ showScheduleButton }: SchedulePageHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t("schedule.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("schedule.pageSubtitle")}</p>
      </div>
      {showScheduleButton ? <ScheduleDialog /> : null}
    </div>
  );
};

export default SchedulePageHeader;
