import ProjectDetailModalAmenitiesSection from "./project-detail-modal-amenities-section";
import ProjectDetailModalHeroSection from "./project-detail-modal-hero-section";
import ProjectDetailModalResourcesSection from "./project-detail-modal-resources-section";
import ProjectDetailModalStatsSection from "./project-detail-modal-stats-section";
import ProjectDetailModalWhatsappSection from "./project-detail-modal-whatsapp-section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/data/mockData";

interface ProjectDetailModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectDetailModal = ({ project, open, onOpenChange }: ProjectDetailModalProps) => {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-left pr-8">{project.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ProjectDetailModalHeroSection project={project} />
          <ProjectDetailModalStatsSection project={project} />
          <ProjectDetailModalResourcesSection project={project} />
          <ProjectDetailModalAmenitiesSection project={project} />
          <ProjectDetailModalWhatsappSection project={project} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailModal;
