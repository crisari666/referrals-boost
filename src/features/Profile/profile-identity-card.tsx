import { motion } from 'framer-motion';

const levelConfig = {
  Bronce: { color: 'bg-level-bronze', next: 'Plata' },
  Plata: { color: 'bg-level-silver', next: 'Oro' },
  Oro: { color: 'bg-level-gold', next: 'Diamante' },
} as const;

export type ProfileLevelKey = keyof typeof levelConfig;

export type ProfileIdentityCardProps = {
  displayName: string;
  initials: string;
  levelKey: string;
  levelProgress: number;
};

export function ProfileIdentityCard({
  displayName,
  initials,
  levelKey,
  levelProgress,
}: ProfileIdentityCardProps) {
  const level =
    levelConfig[levelKey as ProfileLevelKey] ?? levelConfig.Plata;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 border border-border shadow-sm text-center"
    >
      <div className="w-20 h-20 gradient-commission rounded-full mx-auto flex items-center justify-center text-primary-foreground text-2xl font-extrabold">
        {initials}
      </div>
      <h2 className="font-bold text-foreground text-lg mt-3">{displayName}</h2>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className={`w-3 h-3 rounded-full ${level.color}`} />
        <span className="text-sm font-semibold text-foreground">Nivel {levelKey}</span>
      </div>

      <div className="mt-4 max-w-xs mx-auto">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{levelKey}</span>
          <span>{level.next}</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-commission rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {levelProgress}% para {level.next}
        </p>
      </div>
    </motion.div>
  );
}
