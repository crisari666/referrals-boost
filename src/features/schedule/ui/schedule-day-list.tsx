import VisitCard from "./VisitCard";
import type { ScheduleVisitRow } from "@/types/schedule";
import { getDateFnsLocale } from "@/i18n/date-locale";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ScheduleDayListProps {
  selectedDate: Date;
  visits: ScheduleVisitRow[];
  showScheduleAssignee?: boolean;
  assigneeNamesById?: Record<string, string>;
}

const ScheduleDayList = ({
  selectedDate,
  visits,
  showScheduleAssignee = false,
  assigneeNamesById = {},
}: ScheduleDayListProps) => {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateFnsLocale();
  const datePattern = i18n.language?.startsWith("en") ? "EEEE, MMMM d" : "EEEE d 'de' MMMM";
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground capitalize">
        {format(selectedDate, datePattern, { locale: dateLocale })}
      </h2>

      <AnimatePresence mode="wait">
        {visits.length > 0 ? (
          <div className="space-y-3">
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                showScheduleAssignee={showScheduleAssignee}
                assigneeName={assigneeNamesById[visit.scheduleOwnerUserId]}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-12 text-muted-foreground"
          >
            <CalendarDays className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">{t("schedule.emptyDayTitle")}</p>
            <p className="text-xs mt-1">{t("schedule.emptyDayHint")}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleDayList;
