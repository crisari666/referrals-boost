import { ScheduledVisit, visitTypeLabels, visitTypeIcons, visitStatusLabels, visitStatusColors } from "@/types/schedule";
import { Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface VisitCardProps {
  visit: ScheduledVisit;
}

const VisitCard = ({ visit }: VisitCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-4 border border-border shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{visitTypeIcons[visit.type]}</div>
          <div>
            <Link to={`/clients/${visit.clientId}`} className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
              {visit.clientName}
            </Link>
            <p className="text-xs text-muted-foreground">{visit.projectName}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${visitStatusColors[visit.status]}`}>
          {visitStatusLabels[visit.status]}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {visit.time}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {visitTypeLabels[visit.type]}
        </span>
      </div>

      {visit.notes && (
        <p className="mt-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
          {visit.notes}
        </p>
      )}
    </motion.div>
  );
};

export default VisitCard;
