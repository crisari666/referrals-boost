import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Project } from '@/data/mockData';
import { getIntlLocaleTag } from '@/i18n/intl-locale';
import { useProjectDetailModalLabels } from './project-detail-modal-labels';

interface ProjectDetailModalWhatsappSectionProps {
  project: Project;
}

const ProjectDetailModalWhatsappSection = ({ project }: ProjectDetailModalWhatsappSectionProps) => {
  const { t } = useTranslation();
  const LABELS = useProjectDetailModalLabels();
  const priceFormatted = `$${project.priceFrom.toLocaleString(getIntlLocaleTag())}`;
  const whatsappMsg = encodeURIComponent(
    t('projects.whatsappShareBody', {
      title: project.title,
      location: project.location,
      price: priceFormatted,
    }),
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
