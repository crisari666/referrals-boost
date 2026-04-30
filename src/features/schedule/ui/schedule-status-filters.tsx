import { VENTOR_SCHEDULE_STATUS_FILTER_METAS } from "@/features/schedule/lib/schedule.constants";
import type { VentorScheduleStatusApi } from "@/services/scheduleService";
import { useTranslation } from "react-i18next";

interface ScheduleStatusFiltersProps {
  filter: VentorScheduleStatusApi | "all";
  onFilterChange: (value: VentorScheduleStatusApi | "all") => void;
}

const ScheduleStatusFilters = ({
  filter,
  onFilterChange,
}: ScheduleStatusFiltersProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {VENTOR_SCHEDULE_STATUS_FILTER_METAS.map((sf) => (
        <button
          type="button"
          key={sf.value}
          onClick={() => onFilterChange(sf.value)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
            filter === sf.value
              ? "gradient-commission text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          {t(sf.labelKey)}
        </button>
      ))}
    </div>
  );
};

export default ScheduleStatusFilters;
