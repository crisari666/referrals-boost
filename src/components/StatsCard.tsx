import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  gradient: "commission" | "success" | "info" | "gold";
  delay?: number;
}

const gradientMap = {
  commission: "gradient-commission",
  success: "gradient-success",
  info: "gradient-info",
  gold: "gradient-gold",
};

const StatsCard = ({ title, value, subtitle, icon: Icon, gradient, delay = 0 }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-sm border border-border"
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${gradientMap[gradient]} opacity-10 rounded-bl-[40px]`} />
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${gradientMap[gradient]} mb-3`}>
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-extrabold text-foreground mt-1">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </motion.div>
  );
};

export default StatsCard;
