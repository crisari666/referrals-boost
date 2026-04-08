import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export type ProfileSummarySectionProps = {
  clientsTracking: number;
  clientsConverted: number;
  monthCommissions: number;
  totalCommissions: number;
};

export function ProfileSummarySection({
  clientsTracking,
  clientsConverted,
  monthCommissions,
  totalCommissions,
}: ProfileSummarySectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-5 border border-border shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-accent" />
        <h3 className="font-bold text-foreground">Resumen</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{clientsTracking}</p>
          <p className="text-xs text-muted-foreground mt-1">Clientes activos</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{clientsConverted}</p>
          <p className="text-xs text-muted-foreground mt-1">Conversiones</p>
        </div>
        <div className="bg-primary/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-primary">
            ${monthCommissions.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Comisiones del mes</p>
        </div>
        <div className="bg-accent/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-accent">
            ${totalCommissions.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total histórico</p>
        </div>
      </div>
    </motion.div>
  );
}
