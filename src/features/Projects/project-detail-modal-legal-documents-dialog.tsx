import { Download, FileText, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type LegalDocumentsPickerMode = 'download' | 'share';

export type ProjectDetailModalLegalDocumentRow = {
  label: string;
  url: string;
};

interface ProjectDetailModalLegalDocumentsDialogProps {
  open: boolean;
  mode: LegalDocumentsPickerMode | null;
  documents: readonly ProjectDetailModalLegalDocumentRow[];
  title: string;
  onOpenChange: (open: boolean) => void;
  onRequestSharePreview: (url: string, index: number) => void;
}

const ProjectDetailModalLegalDocumentsDialog = ({
  open,
  mode,
  documents,
  title,
  onOpenChange,
  onRequestSharePreview,
}: ProjectDetailModalLegalDocumentsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='grid max-h-[60vh] gap-2 overflow-y-auto'>
          {documents.map((doc, index) => (
            <div
              key={`${doc.url}-${index}`}
              className='flex items-center gap-3 rounded-lg border p-2 transition-colors hover:bg-muted/40'
            >
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted'>
                <FileText className='h-7 w-7 text-muted-foreground' />
              </div>
              <div className='min-w-0 flex-1 text-sm font-medium text-foreground'>{doc.label}</div>
              {mode === 'download' ? (
                <Button
                  size='sm'
                  variant='outline'
                  className='cursor-pointer shrink-0'
                  onClick={() => onRequestSharePreview(doc.url, index)}
                >
                  <Download className='h-4 w-4' />
                </Button>
              ) : (
                <Button
                  size='sm'
                  variant='outline'
                  className='cursor-pointer shrink-0'
                  onClick={() => onRequestSharePreview(doc.url, index)}
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

export default ProjectDetailModalLegalDocumentsDialog;
