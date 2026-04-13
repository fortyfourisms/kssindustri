import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(path?: string | null) {
  if (!path) return "";
  // sudah absolute URL
  if (path.startsWith("http")) return path;
  // sudah diawali /uploads
  if (path.startsWith("/uploads/")) {
    return `${BASE_URL}${path}`;
  }
  // sudah ada prefix uploads/
  if (path.startsWith("uploads/")) {
    return `${BASE_URL}/${path}`;
  }
  // filename saja
  return `${BASE_URL}/uploads/${path}`;
}