import { useCallback, useMemo, useState } from 'react';
import type { ProjectResourceShareSheetResource } from '@/features/Projects/project-resource-share-sheet';
import { useAppSelector } from '@/store';

export function useAssistantResourceShareSheet() {
  const token = useAppSelector((s) => s.auth.user?.token);
  const authHeaders = useMemo(
    () => (typeof token === 'string' && token.length > 0 ? { token } : undefined),
    [token],
  );

  const [open, setOpen] = useState(false);
  const [resource, setResource] = useState<ProjectResourceShareSheetResource | null>(null);

  const openShare = useCallback((next: ProjectResourceShareSheetResource) => {
    setResource(next);
    setOpen(true);
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setResource(null);
  }, []);

  return {
    shareSheetOpen: open,
    shareResource: resource,
    openShare,
    onShareSheetOpenChange: onOpenChange,
    authHeaders,
  };
}
