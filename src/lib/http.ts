import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { getStoredAuthToken } from "@/lib/auth-token";

const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

console.log("BASE_URL", BASE_URL);

const httpClient = axios.create();

function shouldSkipAuthHeader(url: string): boolean {
  if (/signin/i.test(url) || /\/login(\/|$)/i.test(url)) return true;
  return /agent-contract-sign/i.test(url);
}

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const url = config.url ?? "";
  if (shouldSkipAuthHeader(url)) return config;
  const token = getStoredAuthToken();
  if (token) {
    config.headers.set("token", token);
  }
  return config;
});

export interface HttpOptions {
  /** Query params (e.g. ?foo=bar) */
  params?: Record<string, unknown>;
  /** Custom request headers */
  headers?: Record<string, string>;
  /** Override: use this absolute URL instead of BASE_URL + path */
  url?: string;
}

function resolveUrl(path: string, options?: HttpOptions): string {
  if (options?.url) {
    return options.url;
  }
  const base = BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function buildConfig(path: string, options?: HttpOptions): AxiosRequestConfig {
  const url = resolveUrl(path, options);
  const config: AxiosRequestConfig = { url };
  if (options?.params) {
    config.params = options.params;
  }
  if (options?.headers) {
    config.headers = options.headers as AxiosRequestConfig["headers"];
  }
  return config;
}

/**
 * GET request. Use path (relative to BASE_URL) or pass options.url for absolute URL.
 */
export async function get<T = unknown>(
  path: string,
  options?: HttpOptions
): Promise<T> {
  const config = buildConfig(path, options);
  config.method = "GET";
  const { data } = await httpClient.request<T>(config);
  return data;
}

export async function getArrayBuffer(
  path: string,
  options?: HttpOptions
): Promise<ArrayBuffer> {
  const config = buildConfig(path, options);
  config.method = "GET";
  config.responseType = "arraybuffer";
  const { data } = await httpClient.request<ArrayBuffer>(config);
  return data;
}

/**
 * POST request. Use path (relative to BASE_URL) or pass options.url for absolute URL.
 */
export async function post<T = unknown>(
  path: string,
  body?: unknown,
  options?: HttpOptions
): Promise<T> {
  const config = buildConfig(path, options);
  config.method = "POST";
  config.data = body;
  const { data } = await httpClient.request<T>(config);
  return data;
}

export async function postMultipart<T = unknown>(
  path: string,
  formData: FormData,
  options?: HttpOptions
): Promise<T> {
  const config = buildConfig(path, options);
  config.method = "POST";
  config.data = formData;
  const { data } = await httpClient.request<T>(config);
  return data;
}

/**
 * PATCH request. Use path (relative to BASE_URL) or pass options.url for absolute URL.
 */
export async function patch<T = unknown>(
  path: string,
  body?: unknown,
  options?: HttpOptions
): Promise<T> {
  const config = buildConfig(path, options);
  config.method = "PATCH";
  config.data = body;
  const { data } = await httpClient.request<T>(config);
  return data;
}

/**
 * DELETE request. Use path (relative to BASE_URL) or pass options.url for absolute URL.
 */
export async function del<T = unknown>(
  path: string,
  options?: HttpOptions
): Promise<T> {
  const config = buildConfig(path, options);
  config.method = "DELETE";
  const { data } = await httpClient.request<T>(config);
  return data;
}

export const http = {
  get,
  getArrayBuffer,
  post,
  postMultipart,
  patch,
  delete: del,
  del,
};
