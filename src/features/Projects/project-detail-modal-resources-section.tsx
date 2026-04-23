import { useCallback, useState } from 'react';
import { Download, FileText, Images, Share2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { getStoredAuthToken } from '@/lib/auth-token';
import {
  buildProjectResourceDownloadUrl,
  getProjectResourceUrl,
  type ProjectResourceDownloadAttribute,
} from '@/services/projectsService';
import ProjectDetailModalImagePickerDialog from './project-detail-modal-image-picker-dialog';
import { PROJECT_DETAIL_MODAL_LABELS as LABELS } from './project-detail-modal-labels';
import ProjectResourceRowActions from './project-resource-row-actions';
import ProjectResourceShareSheet, { type ProjectResourceShareSheetResource } from './project-resource-share-sheet';
import { getFilenameFromDisposition, getFilenameFromUrl } from './project-resource-share-utils';

interface ProjectDetailModalResourcesSectionProps {
  project: Project;
}

const ProjectDetailModalResourcesSection = ({ project }: ProjectDetailModalResourcesSectionProps) => {
  const [imageDialogMode, setImageDialogMode] = useState<'download' | 'share' | null>(null);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [shareResource, setShareResource] = useState<ProjectResourceShareSheetResource | null>(null);
  const { toast } = useToast();

  const imageUrls = (project.images ?? []).map((name) => getProjectResourceUrl(name)).filter(Boolean);
  const reelVideoUrl = project.reelVideo ? getProjectResourceUrl(project.reelVideo) : '';
  const brochureUrl = project.brochure ? getProjectResourceUrl(project.brochure) : '';
  const planeUrl = project.plane ? getProjectResourceUrl(project.plane) : '';
  const shareMessage = `Mira este recurso de ${project.title}`;
  const token = getStoredAuthToken();
  const authHeaders = token ? { token } : undefined;

  const openShareSheet = useCallback((resource: ProjectResourceShareSheetResource) => {
    setShareResource(resource);
    setShareSheetOpen(true);
  }, []);

  const handleShareSheetOpenChange = useCallback((next: boolean) => {
    setShareSheetOpen(next);
    if (!next) setShareResource(null);
  }, []);

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

  const openVideoShare = () => {
    if (!reelVideoUrl) return;
    openShareSheet({
      previewUrl: reelVideoUrl,
      fetchUrl: reelVideoUrl,
      filename: `${project.title}-video.mp4`,
      previewKind: 'video',
      shareTitle: project.title,
      shareText: shareMessage,
    });
  };

  const openBrochureShare = () => {
    if (!brochureUrl) return;
    openShareSheet({
      previewUrl: brochureUrl,
      fetchUrl: brochureUrl,
      filename: `${project.title}-brochure.pdf`,
      previewKind: 'pdf',
      shareTitle: project.title,
      shareText: shareMessage,
    });
  };

  const openPlaneShare = () => {
    if (!planeUrl) return;
    openShareSheet({
      previewUrl: planeUrl,
      fetchUrl: planeUrl,
      filename: `${project.title}-plano.pdf`,
      previewKind: 'pdf',
      shareTitle: project.title,
      shareText: shareMessage,
    });
  };

  const openImageShareFromPicker = (url: string, index: number) => {
    setImageDialogMode(null);
    openShareSheet({
      previewUrl: url,
      fetchUrl: url,
      filename: `${project.title}-imagen-${index + 1}.jpg`,
      previewKind: 'image',
      shareTitle: project.title,
      shareText: shareMessage,
    });
  };

  return (
    <>
      <div className='space-y-2 pt-1'>
        <p className='text-xs font-medium text-muted-foreground'>{LABELS.recursos}</p>

        <div className='flex items-center justify-between gap-2 rounded-xl border p-3'>
          <div className='flex min-w-0 items-center gap-2 text-sm font-medium'>
            <Video className='h-4 w-4 shrink-0' />
            {LABELS.videos}
          </div>
          <ProjectResourceRowActions
            downloadLabel={LABELS.descargar}
            shareLabel={LABELS.compartir}
            resourceAvailable={Boolean(reelVideoUrl)}
            onDownload={() => void handleAttributeDownload('reelVideo', `${project.title}-video.mp4`)}
            onSharePreview={openVideoShare}
          />
        </div>

        <div className='flex items-center justify-between gap-2 rounded-xl border p-3'>
          <div className='flex min-w-0 items-center gap-2 text-sm font-medium'>
            <Images className='h-4 w-4 shrink-0' />
            {LABELS.imagenes}
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='cursor-pointer'
              disabled={imageUrls.length === 0}
              onClick={() => setImageDialogMode('download')}
            >
              <Download className='h-4 w-4' /> {LABELS.descargar}
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='cursor-pointer'
              disabled={imageUrls.length === 0}
              onClick={() => setImageDialogMode('share')}
            >
              <Share2 className='h-4 w-4' /> {LABELS.compartir}
            </Button>
          </div>
        </div>

        <div className='flex items-center justify-between gap-2 rounded-xl border p-3'>
          <div className='flex min-w-0 items-center gap-2 text-sm font-medium'>
            <FileText className='h-4 w-4 shrink-0' />
            {LABELS.brochure}
          </div>
          <ProjectResourceRowActions
            downloadLabel={LABELS.descargar}
            shareLabel={LABELS.compartir}
            resourceAvailable={Boolean(brochureUrl)}
            onDownload={() => void handleAttributeDownload('brochure', `${project.title}-brochure.pdf`)}
            onSharePreview={openBrochureShare}
          />
        </div>

        <div className='flex items-center justify-between gap-2 rounded-xl border p-3'>
          <div className='flex min-w-0 items-center gap-2 text-sm font-medium'>
            <FileText className='h-4 w-4 shrink-0' />
            {LABELS.planoPdf}
          </div>
          <ProjectResourceRowActions
            downloadLabel={LABELS.descargar}
            shareLabel={LABELS.compartir}
            resourceAvailable={Boolean(planeUrl)}
            onDownload={() => void handleAttributeDownload('plane', `${project.title}-plano.pdf`)}
            onSharePreview={openPlaneShare}
          />
        </div>
      </div>

      <ProjectDetailModalImagePickerDialog
        open={imageDialogMode !== null}
        mode={imageDialogMode}
        imageUrls={imageUrls}
        projectTitle={project.title}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setImageDialogMode(null);
        }}
        onDownloadImage={(url, fallbackName) => void handleDownload(url, fallbackName)}
        onRequestSharePreview={(url, index) => openImageShareFromPicker(url, index)}
      />

      <ProjectResourceShareSheet
        open={shareSheetOpen}
        onOpenChange={handleShareSheetOpenChange}
        resource={shareResource}
        authHeaders={authHeaders}
      />
    </>
  );
};

export default ProjectDetailModalResourcesSection;
