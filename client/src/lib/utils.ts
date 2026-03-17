import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(path: string | undefined | null) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  return `${baseUrl}/uploads/${path}`;
}
