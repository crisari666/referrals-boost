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

export function normalizeRagIngestFilename(fileName: string): string {
  let name = fileName.replace(/^\//, "").trim();
  const lower = name.toLowerCase();
  if (lower.startsWith("uploads/rag/")) {
    name = name.slice("uploads/rag/".length);
  } else if (lower.startsWith("rag/")) {
    name = name.slice(4);
  }
  return name;
}

export function getRagIngestAssetUrl(fileName: string): string {
  if (!fileName) return "";
  const name = normalizeRagIngestFilename(fileName);
  if (!UPLOADS_BASE) return "";
  return `${UPLOADS_BASE}/rag/${name}`;
}

export function resolveAgentChatLinkHref(href: string): string {
  const raw = href.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const lower = raw.toLowerCase();
  if (
    lower.includes("uploads/rag/") ||
    lower.startsWith("rag/") ||
    lower.startsWith("/uploads/rag/")
  ) {
    return getRagIngestAssetUrl(raw);
  }
  const base = raw.split("/").pop() ?? raw;
  if (/^[a-f0-9]{24}_[a-z0-9-]+\.[a-z0-9]+$/i.test(base)) {
    return getRagIngestAssetUrl(raw);
  }
  return getProjectResourceUrl(raw);
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
