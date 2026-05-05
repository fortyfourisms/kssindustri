export type PublicCourseApiItem = {
  id: number | string;
  judul?: string | null;
  deskripsi?: string | null;
  thumbnail?: string | null;
  kategori?: string | null;
  durasi_jp?: number | string | null;
  penyelenggara?: string | null;
  target_peserta?: string | null;
  syarat_pendaftaran?: string | null;
  informasi_umum?: string | null;
  status?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PublicCourseItem = {
  id: string;
  numericId?: number;
  slug: string;
  title: string;
  description: string;
  summary: string;
  thumbnailUrl?: string;
  category: string;
  durationLabel: string;
  provider: string;
  targetParticipant: string;
  registrationRequirements: string;
  generalInfo: string;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};
