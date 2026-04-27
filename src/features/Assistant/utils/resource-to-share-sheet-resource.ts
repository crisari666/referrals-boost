import type { ProjectResourceShareSheetResource } from '@/features/Projects/project-resource-share-sheet';
import type { Resource } from '@/types/assistant';

export function resourceToShareSheetResource(
  resource: Resource,
): ProjectResourceShareSheetResource | null {
  const { openUrl, type, label } = resource;
  if (!openUrl) return null;
  if (type !== 'image' && type !== 'video' && type !== 'pdf') return null;
  return {
    previewUrl: openUrl,
    fetchUrl: openUrl,
    filename: label,
    previewKind: type,
    shareTitle: 'LoteLink',
    shareText: `Mira este recurso: ${label}`,
  };
}

export function partitionAssistantResources(resources: readonly Resource[]): {
  readonly previewable: Resource[];
  readonly badgeOnly: Resource[];
} {
  const previewable: Resource[] = [];
  const badgeOnly: Resource[] = [];
  for (const r of resources) {
    if (resourceToShareSheetResource(r)) previewable.push(r);
    else badgeOnly.push(r);
  }
  return { previewable, badgeOnly };
}
