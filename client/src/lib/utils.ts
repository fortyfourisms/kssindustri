import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(path: string | undefined | null) {
  if (!path) return "";
  // Absolute URL or already-rooted path — return as-is
  if (path.startsWith("http") || path.startsWith("/")) return path;
  // Path already includes 'uploads/' prefix (e.g. "uploads/csirt_photo/uuid.png")
  if (path.startsWith("uploads/")) return `/${path}`;
  // Bare filename / UUID → serve via /uploads proxy
  return `/uploads/${path}`;
}
