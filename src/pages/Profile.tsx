import { currentSeller } from "@/data/mockData";
import { Link2, Copy, Medal, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const levelConfig = {
  Bronce: { color: "bg-level-bronze", next: "Plata", threshold: 30 },
  Plata: { color: "bg-level-silver", next: "Oro", threshold: 70 },
  Oro: { color: "bg-level-gold", next: "Diamante", threshold: 100 },
} as const;

const Profile = () => {
  const { toast } = useToast();
  const level = levelConfig[currentSeller.level as keyof typeof levelConfig];

  const copyLink = () => {
    navigator.clipboard.writeText(currentSeller.referralLink);
    toast({ title: "¡Enlace copiado!", description: "Compártelo con tus clientes potenciales" });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-extrabold text-foreground">Mi Perfil</h1>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 border border-border shadow-sm text-center"
      >
        <div className="w-20 h-20 gradient-commission rounded-full mx-auto flex items-center justify-center text-primary-foreground text-2xl font-extrabold">
          {currentSeller.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <h2 className="font-bold text-foreground text-lg mt-3">{currentSeller.name}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`w-3 h-3 rounded-full ${level.color}`} />
          <span className="text-sm font-semibold text-foreground">Nivel {currentSeller.level}</span>
        </div>

        {/* Level progress */}
        <div className="mt-4 max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{currentSeller.level}</span>
            <span>{level.next}</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-commission rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${currentSeller.levelProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{currentSeller.levelProgress}% para {level.next}</p>
        </div>
      </motion.div>

      {/* Referral link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">Tu Enlace de Referido</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground truncate font-mono">
            {currentSeller.referralLink}
          </div>
          <button
            onClick={copyLink}
            className="w-10 h-10 gradient-commission rounded-xl flex items-center justify-center shrink-0"
          >
            <Copy className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Comparte este enlace y cada cliente que se registre quedará vinculado a ti automáticamente.
        </p>
      </motion.div>

      {/* Stats summary */}
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
            <p className="text-2xl font-extrabold text-foreground">{currentSeller.clientsTracking}</p>
            <p className="text-xs text-muted-foreground mt-1">Clientes activos</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-foreground">{currentSeller.clientsConverted}</p>
            <p className="text-xs text-muted-foreground mt-1">Conversiones</p>
          </div>
          <div className="bg-primary/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-primary">${currentSeller.monthCommissions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Comisiones del mes</p>
          </div>
          <div className="bg-accent/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-accent">${currentSeller.totalCommissions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total histórico</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-warning" />
          <h3 className="font-bold text-foreground">Logros</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {currentSeller.achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center ${
                ach.unlocked ? "border-primary/20 bg-primary/5" : "border-border opacity-40"
              }`}
            >
              <span className="text-2xl">{ach.icon}</span>
              <span className="text-[9px] font-medium text-foreground leading-tight">{ach.title}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
