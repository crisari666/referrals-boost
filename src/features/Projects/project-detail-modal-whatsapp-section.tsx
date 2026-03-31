import { Share2 } from 'lucide-react';
import type { Project } from '@/data/mockData';
import { PROJECT_DETAIL_MODAL_LABELS as LABELS } from './project-detail-modal-labels';

interface ProjectDetailModalWhatsappSectionProps {
  project: Project;
}

const ProjectDetailModalWhatsappSection = ({ project }: ProjectDetailModalWhatsappSectionProps) => {
  const whatsappMsg = encodeURIComponent(
    `¡Hola! 👋 Te comparto información sobre *${project.title}* en ${project.location}. Lotes desde $${project.priceFrom.toLocaleString()}. ¿Te interesa saber más?`
  );

  return (
    <div className='grid grid-cols-1 gap-3 pt-2'>
      <a
        href={`https://wa.me/?text=${whatsappMsg}`}
        target='_blank'
        rel='noopener noreferrer'
        className='gradient-success flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-primary-foreground'
      >
        <Share2 className='h-4 w-4' /> {LABELS.compartirWhatsApp}
      </a>
    </div>
  );
};

export default ProjectDetailModalWhatsappSection;
