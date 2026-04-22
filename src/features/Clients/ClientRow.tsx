import { Link } from "react-router-dom";
import { useMemo, type CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import type { Client } from "@/data/mockData";
import { statusLabels, statusColors } from "@/data/mockData";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store";

function stepBadgeStyle(color: string | undefined): CSSProperties | undefined {
  if (!color?.trim()) return undefined;
  return { backgroundColor: color.trim(), color: "#0f172a" };
}

interface ClientRowProps {
  client: Client;
  index?: number;
  projectTitles: Record<string, string>;
}

const ClientRow = ({ client, index = 0, projectTitles }: ClientRowProps) => {
  const catalog = useAppSelector((s) => s.clients.vendorStepCatalog);
  const currentStep = useMemo(() => {
    if (!client.customerStepId) return null;
    return catalog.find((s) => s.id === client.customerStepId) ?? null;
  }, [catalog, client.customerStepId]);

  const projectTitle = projectTitles[client.projectInterest];
  const displayPhone =
    (client.phone?.trim() || client.whatsapp?.trim() || "").trim() || null;
  const displayDate = (client.assignedDate?.trim() || client.createdAt?.trim() || "").slice(0, 10);
  const dateLabel = client.assignedDate?.trim() ? "Asignado" : "Creado";
  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={`/clients/${client.id}`}
        className="flex items-center gap-3 bg-card p-4 rounded-2xl border border-border hover:shadow-md transition-shadow"
      >
        <div className="w-11 h-11 rounded-full gradient-commission flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{client.name}</p>
          <p className="text-xs text-muted-foreground truncate">{projectTitle || "Sin proyecto"}</p>
        </div>
        {displayPhone ? (
          <span
            className="text-xs text-muted-foreground tabular-nums truncate max-w-[5.5rem] sm:max-w-[7.5rem] text-right shrink-0"
            title={displayPhone}
          >
            {displayPhone}
          </span>
        ) : null}
        {displayDate ? (
          <span
            className="text-xs text-muted-foreground tabular-nums truncate max-w-[7rem] sm:max-w-[8.5rem] text-right shrink-0"
            title={`${dateLabel}: ${displayDate}`}
          >
            {displayDate}
          </span>
        ) : null}
        {catalog.length > 0 ? (
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 truncate max-w-[7rem] sm:max-w-[9rem] ${
              currentStep
                ? "bg-secondary text-foreground"
                : "bg-muted/60 text-muted-foreground font-medium"
            }`}
            style={currentStep ? stepBadgeStyle(currentStep.color) : undefined}
            title={currentStep?.name ?? "Sin etapa"}
          >
            {currentStep?.name ?? "Sin etapa"}
          </span>
        ) : (
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColors[client.status]}`}
          >
            {statusLabels[client.status]}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </Link>
    </motion.div>
  );
};

export default ClientRow;
