import { CheckCircle } from 'lucide-react';
import type { Project } from '@/data/mockData';

interface ProjectDetailModalAmenitiesSectionProps {
  project: Project;
}

const ProjectDetailModalAmenitiesSection = ({ project }: ProjectDetailModalAmenitiesSectionProps) => {
  const hasGroupedAmenities = (project.amenitiesGroups?.length ?? 0) > 0;
  if (!hasGroupedAmenities) return null;

  return (
    <div className='grid grid-cols-2 gap-3'>
      {project.amenitiesGroups?.map((group) => (
        <div key={group.title} className='rounded-xl border bg-secondary/40 p-3'>
          <p className='mb-2 text-xs font-bold text-foreground'>{group.title}</p>
          <div className='space-y-1.5'>
            {group.amenities.map((item) => (
              <div key={`${group.title}-${item}`} className='flex items-center gap-2 text-sm text-foreground'>
                <CheckCircle className='h-4 w-4 shrink-0 text-accent' />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectDetailModalAmenitiesSection;
