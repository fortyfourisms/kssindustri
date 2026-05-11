export type BlogApiItem = {
  id: number | string;
  judul?: string | null;
  deskripsi?: string | null;
  tags?: string[] | null;
  author_id?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BlogItem = {
  id: string;
  numericId?: number;
  slug: string;
  title: string;
  excerpt: string;
  descriptionHtml: string;
  publishedAt: string;
  authorId?: number;
  authorLabel: string;
  tags: string[];
  category: string;
  coverLabel: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};
