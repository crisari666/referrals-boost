import { addDays, format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface ScheduleWeekStripProps {
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  selectedDate: Date;
  onSelectDate: (day: Date) => void;
  pendingCountByDay: Map<string, number>;
}

const ScheduleWeekStrip = ({
  weekStart,
  onPrevWeek,
  onNextWeek,
  selectedDate,
  onSelectDate,
  pendingCountByDay,
}: ScheduleWeekStripProps) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 border border-border shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onPrevWeek}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground capitalize">
          {format(weekStart, "MMMM yyyy", { locale: es })}
        </span>
        <button
          type="button"
          onClick={onNextWeek}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const ymd = format(day, "yyyy-MM-dd");
          const pending = pendingCountByDay.get(ymd) ?? 0;

          return (
            <button
              type="button"
              key={ymd}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center py-2 rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? "gradient-commission text-primary-foreground"
                  : isToday
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-secondary text-foreground"
              }`}
            >
              <span
                className={`text-[10px] font-medium uppercase ${
                  isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {format(day, "EEE", { locale: es })}
              </span>
              <span className="text-lg font-bold">{format(day, "d")}</span>
              {pending > 0 ? (
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  }`}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ScheduleWeekStrip;
