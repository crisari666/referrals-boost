import VisitCard from "./VisitCard";
import type { ScheduleVisitRow } from "@/types/schedule";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

interface ScheduleDayListProps {
  selectedDate: Date;
  visits: ScheduleVisitRow[];
}

const ScheduleDayList = ({ selectedDate, visits }: ScheduleDayListProps) => {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground capitalize">
        {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
      </h2>

      <AnimatePresence mode="wait">
        {visits.length > 0 ? (
          <div className="space-y-3">
            {visits.map((visit) => (
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
            <p className="text-xs mt-1">
              Selecciona otra fecha o agenda una nueva visita
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleDayList;
