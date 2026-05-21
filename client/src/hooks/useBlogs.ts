import { useQuery, useQueryClient } from "@tanstack/react-query";
import { blogsService } from "@/services/blogs.service";
import type { BlogItem } from "@/types/blog.types";

export function useBlogs() {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: () => blogsService.getBlogs(),
  });
}

export function useBlogDetail(slug?: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["blogs", "detail", slug],
    queryFn: async () => {
      const resolvedSlug = slug || "";
      const blogs = await queryClient.ensureQueryData({
        queryKey: ["blogs"],
        queryFn: () => blogsService.getBlogs(),
      });
      const article = blogsService.findBlogBySlug(blogs, resolvedSlug);

      if (!article) {
        throw new Error("Berita tidak ditemukan.");
      }

      return article;
    },
    initialData: () => {
      if (!slug) return undefined;

      const blogs = queryClient.getQueryData<BlogItem[]>(["blogs"]);
      return blogs ? blogsService.findBlogBySlug(blogs, slug) : undefined;
    },
    enabled: Boolean(slug),
  });
}
