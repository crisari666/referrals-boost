import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "@/data/mockData";
import { motion } from "framer-motion";
import { getIntlLocaleTag } from "@/i18n/intl-locale";

interface ProjectCardProps {
  project: Project;
  index?: number;
  onSelect?: (project: Project) => void;
}

const ProjectCard = ({ project, index = 0, onSelect }: ProjectCardProps) => {
  const { t } = useTranslation();
  const intlLocale = getIntlLocaleTag();
  const statusBadge = useMemo(
    () => ({
      "high-demand": { label: t("projects.badgeHighDemand"), className: "gradient-commission text-primary-foreground" },
      limited: { label: t("projects.badgeLimited"), className: "gradient-gold text-primary-foreground" },
      available: { label: t("projects.badgeAvailable"), className: "bg-secondary text-secondary-foreground" },
    }),
    [t],
  );
  const badge = statusBadge[project.status as keyof typeof statusBadge] ?? statusBadge.available;
  const projectCardImage = project.cardProject || project.image;
  const commissionAmount =
    project.commissionType === "%"
      ? Math.round(project.priceFrom * project.commission / 100)
      : project.commission;
  const content = (
    <>
        <div className="relative h-44 overflow-hidden">
          <img
            src={projectCardImage}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-foreground text-base">{project.title}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
            <MapPin className="w-3 h-3" />
            {project.location}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-xs text-muted-foreground">{t("projects.modalFrom")}</p>
              <p className="font-extrabold text-foreground">${project.priceFrom.toLocaleString(intlLocale)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("projects.modalCommission")}</p>
              <p className="font-extrabold text-primary">
                {t("projects.cardCommissionCop")}{" "}
                {commissionAmount.toLocaleString(intlLocale)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Layers className="w-3 h-3" />
            {t("projects.lotsOfTotal", { available: project.lotsAvailable, total: project.totalLots })}
          </div>
        </div>
    </>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(project)}
          className="w-full text-left block bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow group"
        >
          {content}
        </button>
      ) : (
        <Link
          to={`/projects/${project.id}`}
          className="block bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow group"
        >
          {content}
        </Link>
      )}
    </motion.div>
  );
};

export default ProjectCard;
