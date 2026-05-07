import type { AgentChatMediaFile, AgentChatMediaProject } from '@/types/agent-chat';
import type { Resource } from '@/types/assistant';

export function dedupeResources(items: readonly Resource[]): Resource[] {
  const seen = new Set<string>();
  const out: Resource[] = [];
  for (const r of items) {
    const key = `${r.openUrl ?? ''}|${r.copyText ?? ''}|${r.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export function mediaProjectsToResources(
  media: readonly AgentChatMediaProject[] | undefined,
  mapFile: (file: AgentChatMediaFile) => Resource,
): Resource[] {
  if (!media?.length) return [];
  const acc: Resource[] = [];
  for (const project of media) {
    for (const file of project.files) {
      acc.push(mapFile(file));
    }
  }
  return acc;
}
