import { MapPin } from 'lucide-react';
import type { Project } from '@/data/mockData';
import { useProjectDetailModalLabels } from './project-detail-modal-labels';

interface ProjectDetailModalHeroSectionProps {
  project: Project;
}

const ProjectDetailModalHeroSection = ({ project }: ProjectDetailModalHeroSectionProps) => {
  const LABELS = useProjectDetailModalLabels();
  return (
    <>
      {project.image && (
        <div className='-mx-1 h-44 overflow-hidden rounded-xl'>
          <img src={project.image} alt={project.title} className='h-full w-full object-cover' />
        </div>
      )}
      <div className='flex items-center gap-1 text-sm text-muted-foreground'>
        <MapPin className='h-4 w-4 shrink-0' />
        <span>
          {LABELS.ubicacion}: {project.location}
        </span>
      </div>
    </>
  );
};

export default ProjectDetailModalHeroSection;
