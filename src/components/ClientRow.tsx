import { Link } from "react-router-dom";
import { ChevronRight, Phone, MessageCircle } from "lucide-react";
import type { Client } from "@/data/mockData";
import { statusLabels, statusColors, projects } from "@/data/mockData";
import { motion } from "framer-motion";

interface ClientRowProps {
  client: Client;
  index?: number;
}

const ClientRow = ({ client, index = 0 }: ClientRowProps) => {
  const project = projects.find((p) => p.id === client.projectInterest);
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
          <p className="text-xs text-muted-foreground truncate">{project?.title || "Sin proyecto"}</p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColors[client.status]}`}>
          {statusLabels[client.status]}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </Link>
    </motion.div>
  );
};

export default ClientRow;
