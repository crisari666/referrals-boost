import { FileText } from 'lucide-react';
import type { ProjectResourceShareSheetResource } from '@/features/Projects/project-resource-share-sheet';
import type { Resource } from '@/types/assistant';
import { resourceToShareSheetResource } from '../utils/resource-to-share-sheet-resource';

const tileShell =
  'group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-muted/20 text-left transition-colors duration-200 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer';

interface AssistantResourcePreviewTileProps {
  resource: Resource;
  onOpenShare: (payload: ProjectResourceShareSheetResource) => void;
}

const AssistantResourcePreviewTile = ({ resource, onOpenShare }: AssistantResourcePreviewTileProps) => {
  const payload = resourceToShareSheetResource(resource);
  if (!payload || !resource.openUrl) return null;

  const { openUrl, type, label } = resource;

  return (
    <button
      type="button"
      className={tileShell}
      onClick={() => onOpenShare(payload)}
      aria-label={`Ver y compartir: ${label}`}
    >
      <div className="relative aspect-[4/3] w-full bg-background/50">
        {type === 'image' ? (
          <img
            src={openUrl}
            alt=""
            loading="lazy"
            className="pointer-events-none h-full w-full object-cover"
            aria-hidden
          />
        ) : null}
        {type === 'video' ? (
          <video
            src={openUrl}
            className="pointer-events-none h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
            aria-hidden
          />
        ) : null}
        {type === 'pdf' ? (
          <div className="flex h-full min-h-[7rem] flex-col items-center justify-center gap-2 px-3">
            <FileText className="h-10 w-10 text-muted-foreground" aria-hidden />
            <span className="line-clamp-2 text-center text-xs text-muted-foreground">{label}</span>
          </div>
        ) : null}
      </div>
      {type !== 'pdf' ? (
        <span className="line-clamp-2 border-t border-border px-2 py-2 text-left text-xs text-foreground">
          {label}
        </span>
      ) : null}
    </button>
  );
};

export default AssistantResourcePreviewTile;
