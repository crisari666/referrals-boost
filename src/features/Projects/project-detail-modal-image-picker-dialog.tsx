import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PROJECT_DETAIL_MODAL_LABELS as LABELS } from './project-detail-modal-labels';

export type ImagePickerDialogMode = 'download' | 'share';

interface ProjectDetailModalImagePickerDialogProps {
  open: boolean;
  mode: ImagePickerDialogMode | null;
  imageUrls: string[];
  projectTitle: string;
  onOpenChange: (open: boolean) => void;
  onRequestSharePreview: (url: string, index: number) => void;
}

const ProjectDetailModalImagePickerDialog = ({
  open,
  mode,
  imageUrls,
  projectTitle,
  onOpenChange,
  onRequestSharePreview,
}: ProjectDetailModalImagePickerDialogProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{LABELS.seleccionarImagen}</DialogTitle>
        </DialogHeader>
        <div className='grid max-h-[60vh] gap-2 overflow-y-auto'>
          {imageUrls.map((url, index) => (
            <div key={url} className='flex items-center gap-3 rounded-lg border p-2 transition-colors hover:bg-muted/40'>
              <img
                src={url}
                alt={`${projectTitle} ${index + 1}`}
                className='h-14 w-14 rounded-md object-cover'
              />
              <div className='flex-1 text-sm text-muted-foreground'>
                {LABELS.imagen} {index + 1}
              </div>
              {mode === 'download' ? (
                <Button
                  size='sm'
                  variant='outline'
                  className='cursor-pointer shrink-0'
                  onClick={() => onRequestSharePreview(url, index)}
                >
                  <Download className='h-4 w-4' />
                </Button>
              ) : (
                <Button
                  size='sm'
                  variant='outline'
                  className='cursor-pointer shrink-0'
                  onClick={() => onRequestSharePreview(url, index)}
                >
                  <Share2 className='h-4 w-4' />
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailModalImagePickerDialog;
