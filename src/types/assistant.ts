export type ResourceType = "pdf" | "video" | "image" | "contract" | "link";

export interface Resource {
  type: ResourceType;
  label: string;
  url: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  resources?: Resource[];
  timestamp: string;
}
