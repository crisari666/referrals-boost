import { MapPin, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "@/data/mockData";
import { motion } from "framer-motion";

const statusBadge: Record<string, { label: string; className: string }> = {
  "high-demand": { label: "Alta demanda 🔥", className: "gradient-commission text-primary-foreground" },
  limited: { label: "Últimos lotes", className: "gradient-gold text-primary-foreground" },
  available: { label: "Disponible", className: "bg-secondary text-secondary-foreground" },
};

interface ProjectCardProps {
  project: Project;
  index?: number;
  onSelect?: (project: Project) => void;
}

const ProjectCard = ({ project, index = 0, onSelect }: ProjectCardProps) => {
  const badge = statusBadge[project.status];
  const projectCardImage = project.cardProject || project.image;

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
              <p className="text-xs text-muted-foreground">Desde</p>
              <p className="font-extrabold text-foreground">${project.priceFrom.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Comisión</p>
              <p className="font-extrabold text-primary">
                COP {(project.commissionType === "%"
                  ? Math.round(project.priceFrom * project.commission / 100)
                  : project.commission
                ).toLocaleString("es-CO")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Layers className="w-3 h-3" />
            {project.lotsAvailable} de {project.totalLots} lotes disponibles
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
