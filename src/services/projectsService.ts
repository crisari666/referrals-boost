import * as http from "@/lib/http";
import type { ApiProject } from "@/types/project";

const RAG_BASE = (import.meta.env.VITE_URL_RAG_AGENT ?? "").replace(/\/$/, "");
const UPLOADS_OVERRIDE = (import.meta.env.VITE_URL_RAG_AGENT_UPLOADS ?? "").replace(/\/$/, "");
const UPLOADS_BASE = UPLOADS_OVERRIDE || (RAG_BASE ? `${RAG_BASE}/uploads` : "");

function buildRagUrl(path: string): string {
  return `${RAG_BASE}/${path.replace(/^\//, "")}`;
}

export function getProjectImageUrl(imageName: string): string {
  if (!imageName) return "";
  const name = imageName.replace(/^\//, "");
  if (!UPLOADS_BASE) return "";
  return `${UPLOADS_BASE}/projects/${name}`;
}

export function getProjectResourceUrl(fileName: string): string {
  return getProjectImageUrl(fileName);
}

export type ProjectResourceDownloadAttribute =
  | "brochure"
  | "plane"
  | "reelVideo"
  | "cardProject"
  | "verticalVideos";

export function buildProjectResourceDownloadUrl(params: {
  projectId: string;
  attribute: ProjectResourceDownloadAttribute;
  fileName?: string;
}): string {
  const { projectId, attribute, fileName } = params;
  const baseUrl = buildRagUrl(`projects/${projectId}/resources/${attribute}/download`);
  if (attribute !== "verticalVideos") return baseUrl;
  if (!fileName) throw new Error("fileName is required when attribute is verticalVideos");
  return `${baseUrl}?fileName=${encodeURIComponent(fileName)}`;
}

export function getProjects() {
  return http.get<ApiProject[]>("", { url: buildRagUrl("projects") });
}
