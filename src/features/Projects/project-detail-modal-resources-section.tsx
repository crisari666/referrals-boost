import { useCallback, useState } from 'react';
import { Download, FileText, Images, Share2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project } from '@/data/mockData';
import { getStoredAuthToken } from '@/lib/auth-token';
import { getProjectResourceUrl } from '@/services/projectsService';
import ProjectDetailModalImagePickerDialog from './project-detail-modal-image-picker-dialog';
import { PROJECT_DETAIL_MODAL_LABELS as LABELS } from './project-detail-modal-labels';
import ProjectResourceRowActions from './project-resource-row-actions';
import ProjectResourceShareSheet, { type ProjectResourceShareSheetResource } from './project-resource-share-sheet';

interface ProjectDetailModalResourcesSectionProps {
  project: Project;
}

const ProjectDetailModalResourcesSection = ({ project }: ProjectDetailModalResourcesSectionProps) => {
  const [imageDialogMode, setImageDialogMode] = useState<'download' | 'share' | null>(null);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [shareResource, setShareResource] = useState<ProjectResourceShareSheetResource | null>(null);

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
            onDownload={openVideoShare}
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
            onDownload={openBrochureShare}
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
            onDownload={openPlaneShare}
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
