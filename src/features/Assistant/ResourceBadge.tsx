import type { ResourceType } from "@/types/assistant";
import { FileText, Video, Image, FileCheck, Link } from "lucide-react";

interface ResourceBadgeProps {
  type: ResourceType;
  label: string;
  url: string;
}

const iconMap: Record<ResourceType, React.ElementType> = {
  pdf: FileText,
  video: Video,
  image: Image,
  contract: FileCheck,
  link: Link,
};

const colorMap: Record<ResourceType, string> = {
  pdf: "bg-destructive/10 text-destructive border-destructive/20",
  video: "bg-primary/10 text-primary border-primary/20",
  image: "bg-info/10 text-info border-info/20",
  contract: "bg-warning/10 text-warning border-warning/20",
  link: "bg-accent/10 text-accent border-accent/20",
};

const ResourceBadge = ({ type, label, url }: ResourceBadgeProps) => {
  const Icon = iconMap[type];
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-transform hover:scale-105 ${colorMap[type]}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </a>
  );
};

export default ResourceBadge;
