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

export function getProjects() {
  return http.get<ApiProject[]>("", { url: buildRagUrl("projects") });
}
