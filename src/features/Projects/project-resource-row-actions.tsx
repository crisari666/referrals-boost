import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectResourceRowActionsProps {
  downloadLabel: string;
  shareLabel: string;
  resourceAvailable: boolean;
  onDownload: () => void;
  /** Opens preview bottom sheet (works for native share + WhatsApp in sheet) */
  onSharePreview: () => void;
}

const ProjectResourceRowActions = ({
  downloadLabel,
  shareLabel,
  resourceAvailable,
  onDownload,
  onSharePreview,
}: ProjectResourceRowActionsProps) => {
  return (
    <div className='flex shrink-0 items-center gap-2'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='cursor-pointer'
        disabled={!resourceAvailable}
        onClick={onDownload}
      >
        <Download className='h-4 w-4' /> {downloadLabel}
      </Button>
      {resourceAvailable ? (
        <Button type='button' variant='outline' size='sm' className='cursor-pointer' onClick={onSharePreview}>
          <Share2 className='h-4 w-4' /> {shareLabel}
        </Button>
      ) : (
        <Button type='button' variant='outline' size='sm' disabled>
          <Share2 className='h-4 w-4' /> {shareLabel}
        </Button>
      )}
    </div>
  );
};

export default ProjectResourceRowActions;
