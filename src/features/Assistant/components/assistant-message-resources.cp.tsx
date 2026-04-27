import type { ProjectResourceShareSheetResource } from '@/features/Projects/project-resource-share-sheet';
import type { Resource } from '@/types/assistant';
import { partitionAssistantResources } from '../utils/resource-to-share-sheet-resource';
import AssistantResourcePreviewTile from './assistant-resource-preview-tile.cp';
import ResourceBadge from '../ResourceBadge';

interface AssistantMessageResourcesProps {
  resources: Resource[];
  onOpenShare: (payload: ProjectResourceShareSheetResource) => void;
}

const AssistantMessageResources = ({ resources, onOpenShare }: AssistantMessageResourcesProps) => {
  const { previewable, badgeOnly } = partitionAssistantResources(resources);

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recursos</p>
      {previewable.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {previewable.map((res, i) => (
            <AssistantResourcePreviewTile key={`${res.label}-${i}`} resource={res} onOpenShare={onOpenShare} />
          ))}
        </div>
      ) : null}
      {badgeOnly.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {badgeOnly.map((res, i) => (
            <ResourceBadge key={`${res.label}-b-${i}`} {...res} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AssistantMessageResources;
