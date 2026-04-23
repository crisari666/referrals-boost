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

/** `number` = 0–100 from Content-Length; `indeterminate` = size unknown while bytes load */
type BufferLoadProgress = number | 'indeterminate';

async function readResponseAsBlobWithProgress(
  response: Response,
  onProgress: (p: BufferLoadProgress) => void,
  signal?: AbortSignal,
): Promise<Blob> {
  if (!response.ok) throw new Error('Request failed');
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const rawLen = response.headers.get('Content-Length');
  const total = rawLen ? Number.parseInt(rawLen, 10) : NaN;
  const body = response.body;
  const canStreamProgress = body != null && Number.isFinite(total) && total > 0;

  if (!canStreamProgress) {
    onProgress('indeterminate');
    const blob = await response.blob();
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    onProgress(100);
    return blob;
  }

  const reader = body.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;
  onProgress(0);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (signal?.aborted) {
      await reader.cancel();
      throw new DOMException('Aborted', 'AbortError');
    }
    chunks.push(value);
    received += value.length;
    onProgress(Math.min(100, Math.round((received / total) * 100)));
  }

  onProgress(100);
  return new Blob(chunks);
}

const ProjectResourceShareSheet = ({ open, onOpenChange, resource, authHeaders }: ProjectResourceShareSheetProps) => {
  const { toast } = useToast();
  const [prefetchedFile, setPrefetchedFile] = useState<File | null>(null);
  const [prefetching, setPrefetching] = useState(false);
  const [shareInvoking, setShareInvoking] = useState(false);
  const [bufferProgress, setBufferProgress] = useState<BufferLoadProgress | null>(null);
  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (!open || !resource) {
      setPrefetchedFile(null);
      setPrefetching(false);
      setShareInvoking(false);
      setBufferProgress(null);
      return;
    }

    setPrefetchedFile(null);
    setPrefetching(true);
    setBufferProgress('indeterminate');
    const ac = new AbortController();
    let cancelled = false;

    const run = async () => {
      try {
        const response = await fetch(resource.fetchUrl, { mode: 'cors', headers: authHeaders, signal: ac.signal });
        if (!response.ok) throw new Error('Prefetch failed');
        const blob = await readResponseAsBlobWithProgress(response, setBufferProgress, ac.signal);
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
        if (!cancelled) {
          setPrefetching(false);
          setBufferProgress(null);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [open, resource, authHeaders, toast]);

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
        setBufferProgress('indeterminate');
        const response = await fetch(resource.fetchUrl, { mode: 'cors', headers: authHeaders });
        if (!response.ok) throw new Error('Share request failed');
        const blob = await readResponseAsBlobWithProgress(response, setBufferProgress);
        const fileType = blob.type || getMimeTypeFromFilename(resource.filename);
        file = new File([blob], resource.filename, { type: fileType });
        setBufferProgress(null);
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
      setBufferProgress(null);
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

        <p className='mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
          {prefetching ? (
            <>
              <Loader2 className='h-3.5 w-3.5 shrink-0 animate-spin' aria-hidden />
              {LABELS.preparandoParaCompartir}
              {typeof bufferProgress === 'number' ? (
                <span className='tabular-nums text-foreground'>{bufferProgress}%</span>
              ) : null}
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
              className='relative flex-1 cursor-pointer overflow-hidden'
              disabled={shareInvoking}
              aria-busy={shareInvoking || prefetching}
              {...(typeof bufferProgress === 'number'
                ? { 'aria-valuenow': bufferProgress, 'aria-valuemin': 0, 'aria-valuemax': 100 }
                : {})}
              onClick={() => void handleNativeShare()}
            >
              {(prefetching || (shareInvoking && !prefetchedFile)) && bufferProgress != null && (
                <span
                  className='pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-primary-foreground/25'
                  aria-hidden
                >
                  {typeof bufferProgress === 'number' ? (
                    <span
                      className='block h-full bg-primary-foreground/90 transition-[width] duration-150 ease-out'
                      style={{ width: `${bufferProgress}%` }}
                    />
                  ) : (
                    <span className='block h-full w-[35%] animate-share-indeterminate bg-primary-foreground/90' />
                  )}
                </span>
              )}
              <span className='relative z-[1] flex items-center justify-center'>
                {shareInvoking ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Share2 className='mr-2 h-4 w-4' />
                )}
                {LABELS.compartir}
                {typeof bufferProgress === 'number' ? (
                  <span className='ml-2 text-xs tabular-nums opacity-90'>{bufferProgress}%</span>
                ) : null}
              </span>
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
