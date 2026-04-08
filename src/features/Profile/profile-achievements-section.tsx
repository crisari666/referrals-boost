import { Award } from 'lucide-react';
import { motion } from 'framer-motion';

export type ProfileAchievement = {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
};

export type ProfileAchievementsSectionProps = {
  achievements: ProfileAchievement[];
};

export function ProfileAchievementsSection({ achievements }: ProfileAchievementsSectionProps) {
  return (
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
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center ${
              ach.unlocked ? 'border-primary/20 bg-primary/5' : 'border-border opacity-40'
            }`}
          >
            <span className="text-2xl">{ach.icon}</span>
            <span className="text-[9px] font-medium text-foreground leading-tight">
              {ach.title}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
