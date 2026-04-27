import { useCallback, useState, type ElementType } from 'react';
import type { ResourceType } from '@/types/assistant';
import { Copy, FileCheck, FileText, Image, Link, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ResourceBadgeProps {
  type: ResourceType;
  label: string;
  openUrl?: string;
  previewUrl?: string;
  copyText?: string;
}

const iconMap: Record<ResourceType, ElementType> = {
  pdf: FileText,
  video: Video,
  image: Image,
  contract: FileCheck,
  link: Link,
};

const colorMap: Record<ResourceType, string> = {
  pdf: 'bg-destructive/10 text-destructive border-destructive/20',
  video: 'bg-primary/10 text-primary border-primary/20',
  image: 'bg-info/10 text-info border-info/20',
  contract: 'bg-warning/10 text-warning border-warning/20',
  link: 'bg-accent/10 text-accent border-accent/20',
};

const chipClass =
  'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors duration-200 cursor-pointer';

const ResourceBadge = ({
  type,
  label,
  openUrl,
  previewUrl,
  copyText,
}: ResourceBadgeProps) => {
  const Icon = iconMap[type];
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast({ title: 'Copiado', description: 'Referencia copiada al portapapeles.' });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'No se pudo copiar',
        description: 'Permite acceso al portapapeles o copia el texto manualmente.',
        variant: 'destructive',
      });
    }
  }, [copyText]);

  if (openUrl) {
    return (
      <a
        href={openUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${chipClass} hover:opacity-90 ${colorMap[type]}`}
      >
        {previewUrl && type === 'image' ? (
          <img
            src={previewUrl}
            alt={label}
            loading="lazy"
            className="w-8 h-8 rounded object-cover shrink-0 border border-border"
          />
        ) : null}
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate max-w-[200px]">{label}</span>
      </a>
    );
  }

  if (copyText) {
    return (
      <button
        type="button"
        onClick={onCopy}
        className={`${chipClass} ${colorMap[type]}`}
        title={copyText}
        aria-label={`Copiar referencia: ${label}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <Copy className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden />
        <span className="truncate max-w-[180px]">{copied ? 'Copiado' : label}</span>
      </button>
    );
  }

  return null;
};

export default ResourceBadge;
