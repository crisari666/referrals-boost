import { useState } from 'react';
import { Download, FileText, Images, Loader2, Share2, Video } from 'lucide-react';
import { WhatsappShareButton } from 'react-share';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Project } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { getStoredAuthToken } from '@/lib/auth-token';
import {
  buildProjectResourceDownloadUrl,
  getProjectResourceUrl,
  type ProjectResourceDownloadAttribute,
} from '@/services/projectsService';
import { PROJECT_DETAIL_MODAL_LABELS as LABELS } from './project-detail-modal-labels';

interface ProjectDetailModalResourcesSectionProps {
  project: Project;
}

const shareButtonClassName =
  'inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground';

const getFilenameFromUrl = (url: string, fallbackName: string) => {
  try {
    const parsedUrl = new URL(url);
    const pathName = parsedUrl.pathname.split('/').pop();
    if (pathName) return decodeURIComponent(pathName);
    return fallbackName;
  } catch {
    return fallbackName;
  }
};

const getMimeTypeFromFilename = (filename: string) => {
  const normalized = filename.toLowerCase();
  if (normalized.endsWith('.mp4')) return 'video/mp4';
  if (normalized.endsWith('.pdf')) return 'application/pdf';
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.gif')) return 'image/gif';
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
};

const ProjectDetailModalResourcesSection = ({ project }: ProjectDetailModalResourcesSectionProps) => {
  const [imageDialogMode, setImageDialogMode] = useState<'download' | 'share' | null>(null);
  const [sharingResourceKey, setSharingResourceKey] = useState<string | null>(null);
  const { toast } = useToast();

  const imageUrls = (project.images ?? []).map((name) => getProjectResourceUrl(name)).filter(Boolean);
  const reelVideoUrl = project.reelVideo ? getProjectResourceUrl(project.reelVideo) : '';
  const brochureUrl = project.brochure ? getProjectResourceUrl(project.brochure) : '';
  const planeUrl = project.plane ? getProjectResourceUrl(project.plane) : '';
  const shareMessage = `Mira este recurso de ${project.title}`;
  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const token = getStoredAuthToken();
  const authHeaders = token ? { token } : undefined;

  const handleDownload = async (url: string, fallbackName: string) => {
    if (!url) return;

    const filename = getFilenameFromUrl(url, fallbackName);
    const shouldDownload = window.confirm(`Do you want to download "${filename}"?`);
    if (!shouldDownload) return;

    try {
      const response = await fetch(url, { mode: 'cors', headers: authHeaders });
      if (!response.ok) throw new Error('Download request failed');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => {
        if (!document.hidden) {
          window.alert('Download was blocked by the file server. Please ask backend to enable CORS/download headers for this resource.');
        }
      }, 700);
    }
  };

  const getFilenameFromDisposition = (contentDisposition: string | null, fallbackName: string) => {
    if (!contentDisposition) return fallbackName;
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (filenameMatch?.[1]) return filenameMatch[1];
    return fallbackName;
  };

  const handleAttributeDownload = async (attribute: ProjectResourceDownloadAttribute, fallbackName: string) => {
    const shouldDownload = window.confirm(`Do you want to download "${fallbackName}"?`);
    if (!shouldDownload) return;

    try {
      const url = buildProjectResourceDownloadUrl({ projectId: project.id, attribute });
      const response = await fetch(url, { method: 'GET', headers: authHeaders });

      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          toast({
            title: 'Resource unavailable',
            description: 'This resource is not available for download yet.',
          });
          return;
        }
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const filename = getFilenameFromDisposition(response.headers.get('Content-Disposition'), fallbackName);
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast({
        title: 'Download error',
        description: 'Could not download the resource. Please try again.',
      });
    }
  };

  const handleNativeShare = async (url: string, fallbackName: string, resourceKey: string) => {
    if (!url || !canUseNativeShare) return;

    const filename = getFilenameFromUrl(url, fallbackName);
    setSharingResourceKey(resourceKey);
    try {
      const response = await fetch(url, { mode: 'cors', headers: authHeaders });
      if (!response.ok) throw new Error('Share request failed');

      const blob = await response.blob();
      const fileType = blob.type || getMimeTypeFromFilename(filename);
      const file = new File([blob], filename, { type: fileType });

      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: project.title,
          text: shareMessage,
          files: [file],
        });
        return;
      }

      toast({
        title: 'Share not supported',
        description: 'Your browser does not support sharing files on this device.',
      });
    } catch {
      toast({
        title: 'Share error',
        description: 'Could not prepare the file to share. Please try again.',
      });
    } finally {
      setSharingResourceKey(null);
    }
  };

  const shareBusy = sharingResourceKey !== null;
  const shareIcon = (key: string) =>
    sharingResourceKey === key ? <Loader2 className='h-4 w-4 animate-spin' aria-hidden /> : <Share2 className='h-4 w-4' />;

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
            <Button
              variant='outline'
              size='sm'
              disabled={!reelVideoUrl}
              onClick={() => void handleAttributeDownload('reelVideo', `${project.title}-video.mp4`)}
            >
              <Download className='h-4 w-4' /> {LABELS.descargar}
            </Button>
            {reelVideoUrl ? (
              canUseNativeShare ? (
                <Button
                  variant='outline'
                  size='sm'
                  disabled={shareBusy}
                  aria-busy={sharingResourceKey === 'reelVideo'}
                  onClick={() => void handleNativeShare(reelVideoUrl, `${project.title}-video.mp4`, 'reelVideo')}
                >
                  {shareIcon('reelVideo')} {LABELS.compartir}
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
            <Button
              variant='outline'
              size='sm'
              disabled={imageUrls.length === 0 || shareBusy}
              onClick={() => setImageDialogMode('share')}
            >
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
            <Button
              variant='outline'
              size='sm'
              disabled={!brochureUrl}
              onClick={() => void handleAttributeDownload('brochure', `${project.title}-brochure.pdf`)}
            >
              <Download className='h-4 w-4' /> {LABELS.descargar}
            </Button>
            {brochureUrl ? (
              canUseNativeShare ? (
                <Button
                  variant='outline'
                  size='sm'
                  disabled={shareBusy}
                  aria-busy={sharingResourceKey === 'brochure'}
                  onClick={() => void handleNativeShare(brochureUrl, `${project.title}-brochure.pdf`, 'brochure')}
                >
                  {shareIcon('brochure')} {LABELS.compartir}
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
            <Button
              variant='outline'
              size='sm'
              disabled={!planeUrl}
              onClick={() => void handleAttributeDownload('plane', `${project.title}-plano.pdf`)}
            >
              <Download className='h-4 w-4' /> {LABELS.descargar}
            </Button>
            {planeUrl ? (
              canUseNativeShare ? (
                <Button
                  variant='outline'
                  size='sm'
                  disabled={shareBusy}
                  aria-busy={sharingResourceKey === 'plane'}
                  onClick={() => void handleNativeShare(planeUrl, `${project.title}-plano.pdf`, 'plane')}
                >
                  {shareIcon('plane')} {LABELS.compartir}
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
                  <Button size='sm' variant='outline' onClick={() => void handleDownload(url, `${project.title}-imagen-${index + 1}.jpg`)}>
                    <Download className='h-4 w-4' />
                  </Button>
                ) : canUseNativeShare ? (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={shareBusy}
                    aria-busy={sharingResourceKey === `image:${url}`}
                    onClick={() => void handleNativeShare(url, `${project.title}-imagen-${index + 1}.jpg`, `image:${url}`)}
                  >
                    {shareIcon(`image:${url}`)}
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
