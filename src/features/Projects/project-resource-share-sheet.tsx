import { useCallback, useEffect, useState } from 'react';
import { Download, Loader2, Share2 } from 'lucide-react';
import { WhatsappShareButton } from 'react-share';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PROJECT_DETAIL_MODAL_LABELS as LABELS } from './project-detail-modal-labels';
import {
  getFilenameFromUrl,
  getMimeTypeFromFilename,
  PROJECT_RESOURCE_WHATSAPP_BUTTON_CLASSNAME,
} from './project-resource-share-utils';

export type ProjectResourceSharePreviewKind = 'image' | 'video' | 'pdf';

export interface ProjectResourceShareSheetResource {
  previewUrl: string;
  fetchUrl: string;
  filename: string;
  previewKind: ProjectResourceSharePreviewKind;
  shareTitle: string;
  shareText: string;
}

interface ProjectResourceShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: ProjectResourceShareSheetResource | null;
  authHeaders?: Record<string, string>;
}

const ProjectResourceShareSheet = ({ open, onOpenChange, resource, authHeaders }: ProjectResourceShareSheetProps) => {
  const { toast } = useToast();
  const [prefetchedFile, setPrefetchedFile] = useState<File | null>(null);
  const [prefetching, setPrefetching] = useState(false);
  const [shareInvoking, setShareInvoking] = useState(false);
  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (!open || !resource) {
      setPrefetchedFile(null);
      setPrefetching(false);
      setShareInvoking(false);
      return;
    }

    setPrefetchedFile(null);
    setPrefetching(true);
    const ac = new AbortController();
    let cancelled = false;

    const run = async () => {
      try {
        const response = await fetch(resource.fetchUrl, { mode: 'cors', headers: authHeaders, signal: ac.signal });
        if (!response.ok) throw new Error('Prefetch failed');
        const blob = await response.blob();
        const fileType = blob.type || getMimeTypeFromFilename(resource.filename);
        const file = new File([blob], resource.filename, { type: fileType });
        if (!cancelled) setPrefetchedFile(file);
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === 'AbortError')) return;
        if (!cancelled) {
          setPrefetchedFile(null);
          toast({
            title: LABELS.errorPrepararCompartir,
            description: LABELS.errorPrepararCompartirDesc,
          });
        }
      } finally {
        if (!cancelled) setPrefetching(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [open, resource?.fetchUrl, resource?.filename, resource?.previewKind, authHeaders, toast]);

  const handleDownload = useCallback(async () => {
    if (!resource) return;
    const filename = getFilenameFromUrl(resource.fetchUrl, resource.filename);
    const shouldDownload = window.confirm(`Do you want to download "${filename}"?`);
    if (!shouldDownload) return;

    try {
      if (prefetchedFile) {
        const blobUrl = URL.createObjectURL(prefetchedFile);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = prefetchedFile.name;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(blobUrl);
        return;
      }

      const response = await fetch(resource.fetchUrl, { mode: 'cors', headers: authHeaders });
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
      anchor.href = resource.previewUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => {
        if (!document.hidden) {
          window.alert(
            'Download was blocked by the file server. Please ask backend to enable CORS/download headers for this resource.',
          );
        }
      }, 700);
    }
  }, [authHeaders, prefetchedFile, resource]);

  const handleNativeShare = useCallback(async () => {
    if (!resource || !canUseNativeShare) return;

    setShareInvoking(true);
    try {
      let file = prefetchedFile;
      if (!file) {
        const response = await fetch(resource.fetchUrl, { mode: 'cors', headers: authHeaders });
        if (!response.ok) throw new Error('Share request failed');
        const blob = await response.blob();
        const fileType = blob.type || getMimeTypeFromFilename(resource.filename);
        file = new File([blob], resource.filename, { type: fileType });
      }

      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: resource.shareTitle,
          text: resource.shareText,
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
      setShareInvoking(false);
    }
  }, [authHeaders, canUseNativeShare, prefetchedFile, resource, toast]);

  const preview = resource ? (
    <div className='flex min-h-[180px] max-h-[45vh] w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/30'>
      {resource.previewKind === 'image' ? (
        <img
          src={resource.previewUrl}
          alt={resource.filename}
          className='max-h-[45vh] w-full object-contain'
        />
      ) : resource.previewKind === 'video' ? (
        <video
          src={resource.previewUrl}
          className='max-h-[45vh] w-full object-contain'
          controls
          playsInline
          muted
          preload='metadata'
        />
      ) : (
        <iframe
          title={resource.filename}
          src={resource.previewUrl}
          className='h-[min(45vh,420px)] w-full rounded-md bg-background'
        />
      )}
    </div>
  ) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='bottom'
        overlayClassName='z-[100]'
        className={cn('z-[101] max-h-[90vh] overflow-y-auto rounded-t-2xl px-4 pb-6 pt-2')}
      >
        <SheetHeader className='space-y-1 pb-2 text-left'>
          <SheetTitle className='text-base'>{LABELS.vistaPrevia}</SheetTitle>
          {resource ? (
            <p className='truncate text-sm font-normal text-muted-foreground'>{resource.filename}</p>
          ) : null}
        </SheetHeader>

        {preview}

        <p className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
          {prefetching ? (
            <>
              <Loader2 className='h-3.5 w-3.5 shrink-0 animate-spin' aria-hidden />
              {LABELS.preparandoParaCompartir}
            </>
          ) : prefetchedFile ? (
            LABELS.listoParaCompartir
          ) : null}
        </p>

        <SheetFooter className='mt-4 flex w-full flex-row gap-2 sm:justify-stretch'>
          <Button type='button' variant='outline' className='flex-1 cursor-pointer' onClick={() => void handleDownload()}>
            <Download className='mr-2 h-4 w-4' />
            {LABELS.descargar}
          </Button>
          {canUseNativeShare ? (
            <Button
              type='button'
              variant='default'
              className='flex-1 cursor-pointer'
              disabled={shareInvoking}
              aria-busy={shareInvoking}
              onClick={() => void handleNativeShare()}
            >
              {shareInvoking ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Share2 className='mr-2 h-4 w-4' />}
              {LABELS.compartir}
            </Button>
          ) : resource ? (
            <WhatsappShareButton
              url={resource.previewUrl}
              title={resource.shareText}
              className={cn(PROJECT_RESOURCE_WHATSAPP_BUTTON_CLASSNAME, 'flex-1')}
            >
              <Share2 className='mr-2 h-4 w-4' />
              {LABELS.compartir}
            </WhatsappShareButton>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ProjectResourceShareSheet;
