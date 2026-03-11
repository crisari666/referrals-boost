import { useAppSelector } from "@/store";
import { useMemo, useState } from "react";
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VisitCard from "@/components/schedule/VisitCard";
import ScheduleDialog from "@/components/schedule/ScheduleDialog";
import type { VisitStatus } from "@/types/schedule";

const statusFilters: { value: VisitStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "programada", label: "Programadas" },
  { value: "completada", label: "Completadas" },
  { value: "cancelada", label: "Canceladas" },
];

const Schedule = () => {
  const visits = useAppSelector((s) => s.schedule.visits);
  const user = useAppSelector((s) => s.auth.user);
  const isPhysical = user?.role === "asesor_fisico" || user?.role === "admin";

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [filter, setFilter] = useState<VisitStatus | "all">("all");

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const filteredVisits = useMemo(() => {
    return visits
      .filter((v) => isSameDay(parseISO(v.date), selectedDate))
      .filter((v) => filter === "all" || v.status === filter)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [visits, selectedDate, filter]);

  const getVisitCountForDay = (day: Date) =>
    visits.filter((v) => isSameDay(parseISO(v.date), day) && v.status === "programada").length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground">Visitas programadas</p>
        </div>
        {isPhysical && <ScheduleDialog />}
      </div>

      {/* Week strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-4 border border-border shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-semibold text-foreground capitalize">
            {format(weekStart, "MMMM yyyy", { locale: es })}
          </span>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const count = getVisitCountForDay(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center py-2 rounded-xl transition-all ${
                  isSelected
                    ? "gradient-commission text-primary-foreground"
                    : isToday
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                <span className={`text-[10px] font-medium uppercase ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {format(day, "EEE", { locale: es })}
                </span>
                <span className="text-lg font-bold">{format(day, "d")}</span>
                {count > 0 && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setFilter(sf.value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              filter === sf.value
                ? "gradient-commission text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Visits list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground capitalize">
          {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
        </h2>

        <AnimatePresence mode="wait">
          {filteredVisits.length > 0 ? (
            <div className="space-y-3">
              {filteredVisits.map((visit) => (
                <VisitCard key={visit.id} visit={visit} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-12 text-muted-foreground"
            >
              <CalendarDays className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">Sin visitas este día</p>
              <p className="text-xs mt-1">Selecciona otra fecha o agenda una nueva visita</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Schedule;
