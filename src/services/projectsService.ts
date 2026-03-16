/**
 * Projects service — all requests go through the centralized http client.
 */

import * as http from "@/lib/http";
import type { Project } from "@/data/mockData";

const BASE = "/api/projects";

/** GET /api/projects */
export function getProjects() {
  return http.get<Project[]>(BASE);
}

/** GET /api/projects/:id */
export function getProject(id: string) {
  return http.get<Project>(`${BASE}/${id}`);
}
