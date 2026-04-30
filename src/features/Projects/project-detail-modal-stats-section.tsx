import { Layers } from 'lucide-react';
import type { Project } from '@/data/mockData';
import { getIntlLocaleTag } from '@/i18n/intl-locale';
import { useProjectDetailModalLabels } from './project-detail-modal-labels';
import { useTranslation } from 'react-i18next';

interface ProjectDetailModalStatsSectionProps {
  project: Project;
}

const ProjectDetailModalStatsSection = ({ project }: ProjectDetailModalStatsSectionProps) => {
  const LABELS = useProjectDetailModalLabels();
  const { t } = useTranslation();
  const commissionValue =
    project.commissionType === '%' ? Math.round((project.priceFrom * project.commission) / 100) : project.commission;

  return (
    <div className='grid grid-cols-2 gap-3'>
      <div className='rounded-xl bg-secondary p-3 text-center'>
        <p className='text-xs text-muted-foreground'>{LABELS.desde}</p>
        <p className='text-sm font-extrabold text-foreground'>${project.priceFrom.toLocaleString()}</p>
      </div>
      <div className='rounded-xl bg-primary/10 p-3 text-center'>
        <p className='text-xs text-muted-foreground'>{LABELS.comision}</p>
        <p className='text-sm font-extrabold text-primary'>
          {project.commissionType === '%' ? `${project.commission}%` : `$${project.commission.toLocaleString()}`}
        </p>
      </div>
      <div className='rounded-xl bg-accent/10 p-3 text-center'>
        <p className='text-xs text-muted-foreground'>{LABELS.valorComision}</p>
        <p className='text-sm font-extrabold text-foreground'>
          COP {commissionValue.toLocaleString(getIntlLocaleTag())}
        </p>
      </div>
      <div className='rounded-xl bg-secondary p-3 text-center'>
        <p className='text-xs text-muted-foreground'>{LABELS.lotes}</p>
        <p className='flex items-center justify-center gap-1 text-sm font-extrabold text-foreground'>
          <Layers className='h-3 w-3' />
          {t('projects.lotsOfTotal', { available: project.lotsAvailable, total: project.totalLots })}
        </p>
      </div>
    </div>
  );
};

export default ProjectDetailModalStatsSection;
