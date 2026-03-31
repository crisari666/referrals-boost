import { useState } from 'react';
import { Download, FileText, Images, Share2, Video } from 'lucide-react';
import { WhatsappShareButton } from 'react-share';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Project } from '@/data/mockData';
import { getProjectResourceUrl } from '@/services/projectsService';
import { PROJECT_DETAIL_MODAL_LABELS as LABELS } from './project-detail-modal-labels';

interface ProjectDetailModalResourcesSectionProps {
  project: Project;
}

const shareButtonClassName =
  'inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground';

const ProjectDetailModalResourcesSection = ({ project }: ProjectDetailModalResourcesSectionProps) => {
  const [imageDialogMode, setImageDialogMode] = useState<'download' | 'share' | null>(null);

  const imageUrls = (project.images ?? []).map((name) => getProjectResourceUrl(name)).filter(Boolean);
  const reelVideoUrl = project.reelVideo ? getProjectResourceUrl(project.reelVideo) : '';
  const brochureUrl = project.brochure ? getProjectResourceUrl(project.brochure) : '';
  const planeUrl = project.plane ? getProjectResourceUrl(project.plane) : '';
  const shareMessage = `Mira este recurso de ${project.title}`;
  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleDownload = (url: string) => {
    if (!url) return;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.download = '';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleNativeShare = async (url: string) => {

    if (!url || !canUseNativeShare) return;
    await navigator.share({
      title: project.title,
      text: shareMessage,
      url,
    });
  };

  console.log('canUseNativeShare', canUseNativeShare);

  return (
    <>
      <div className='space-y-2 pt-1'>
        <p className='text-xs font-medium text-muted-foreground'>{LABELS.recursos}</p>

        <div className='flex items-center justify-between gap-2 rounded-xl border p-3'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <Video className='h-4 w-4' />
            {LABELS.videos}
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' disabled={!reelVideoUrl} onClick={() => handleDownload(reelVideoUrl)}>
              <Download className='h-4 w-4' /> {LABELS.descargar}
            </Button>
            {reelVideoUrl ? (
              canUseNativeShare ? (
                <Button variant='outline' size='sm' onClick={() => void handleNativeShare(reelVideoUrl)}>
                  <Share2 className='h-4 w-4' /> {LABELS.compartir}
                </Button>
              ) : (
                <WhatsappShareButton url={reelVideoUrl} title={shareMessage} className={shareButtonClassName}>
                  <Share2 className='h-4 w-4' /> {LABELS.compartir}
                </WhatsappShareButton>
              )
            ) : (
              <Button variant='outline' size='sm' disabled>
                <Share2 className='h-4 w-4' /> {LABELS.compartir}
              </Button>
            )}
          </div>
        </div>

        <div className='flex items-center justify-between gap-2 rounded-xl border p-3'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <Images className='h-4 w-4' />
            {LABELS.imagenes}
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={imageUrls.length === 0}
              onClick={() => setImageDialogMode('download')}
            >
              <Download className='h-4 w-4' /> {LABELS.descargar}
            </Button>
            <Button variant='outline' size='sm' disabled={imageUrls.length === 0} onClick={() => setImageDialogMode('share')}>
              <Share2 className='h-4 w-4' /> {LABELS.compartir}
            </Button>
          </div>
        </div>

        <div className='flex items-center justify-between gap-2 rounded-xl border p-3'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <FileText className='h-4 w-4' />
            {LABELS.brochure}
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' disabled={!brochureUrl} onClick={() => handleDownload(brochureUrl)}>
              <Download className='h-4 w-4' /> {LABELS.descargar}
            </Button>
            {brochureUrl ? (
              canUseNativeShare ? (
                <Button variant='outline' size='sm' onClick={() => void handleNativeShare(brochureUrl)}>
                  <Share2 className='h-4 w-4' /> {LABELS.compartir}
                </Button>
              ) : (
                <WhatsappShareButton url={brochureUrl} title={shareMessage} className={shareButtonClassName}>
                  <Share2 className='h-4 w-4' /> {LABELS.compartir}
                </WhatsappShareButton>
              )
            ) : (
              <Button variant='outline' size='sm' disabled>
                <Share2 className='h-4 w-4' /> {LABELS.compartir}
              </Button>
            )}
          </div>
        </div>

        <div className='flex items-center justify-between gap-2 rounded-xl border p-3'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <FileText className='h-4 w-4' />
            {LABELS.planoPdf}
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' disabled={!planeUrl} onClick={() => handleDownload(planeUrl)}>
              <Download className='h-4 w-4' /> {LABELS.descargar}
            </Button>
            {planeUrl ? (
              canUseNativeShare ? (
                <Button variant='outline' size='sm' onClick={() => void handleNativeShare(planeUrl)}>
                  <Share2 className='h-4 w-4' /> {LABELS.compartir}
                </Button>
              ) : (
                <WhatsappShareButton url={planeUrl} title={shareMessage} className={shareButtonClassName}>
                  <Share2 className='h-4 w-4' /> {LABELS.compartir}
                </WhatsappShareButton>
              )
            ) : (
              <Button variant='outline' size='sm' disabled>
                <Share2 className='h-4 w-4' /> {LABELS.compartir}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={imageDialogMode !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setImageDialogMode(null);
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>{LABELS.seleccionarImagen}</DialogTitle>
          </DialogHeader>
          <div className='grid max-h-[60vh] gap-2 overflow-y-auto'>
            {imageUrls.map((url, index) => (
              <div key={url} className='flex items-center gap-3 rounded-lg border p-2'>
                <img src={url} alt={`${project.title}-${index + 1}`} className='h-14 w-14 rounded-md object-cover' />
                <div className='flex-1 text-sm text-muted-foreground'>Imagen {index + 1}</div>
                {imageDialogMode === 'download' ? (
                  <Button size='sm' variant='outline' onClick={() => handleDownload(url)}>
                    <Download className='h-4 w-4' />
                  </Button>
                ) : canUseNativeShare ? (
                  <Button size='sm' variant='outline' onClick={() => void handleNativeShare(url)}>
                    <Share2 className='h-4 w-4' />
                  </Button>
                ) : (
                  <WhatsappShareButton url={url} title={shareMessage} className={shareButtonClassName}>
                    <Share2 className='h-4 w-4' />
                  </WhatsappShareButton>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectDetailModalResourcesSection;
