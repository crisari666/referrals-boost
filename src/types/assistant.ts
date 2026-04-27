export type ResourceType = 'pdf' | 'video' | 'image' | 'contract' | 'link';

export interface Resource {
  type: ResourceType;
  label: string;
  /** When set, opens in a new tab */
  openUrl?: string;
  /** Thumbnail for image resources */
  previewUrl?: string;
  /** When no openUrl, copy this raw citation string */
  copyText?: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  resources?: Resource[];
  timestamp: string;
}
