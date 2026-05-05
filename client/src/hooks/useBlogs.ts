import { useQuery } from "@tanstack/react-query";
import { blogsService } from "@/services/blogs.service";

export function useBlogs() {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: () => blogsService.getBlogs(),
  });
}

export function useBlogDetail(slug?: string) {
  return useQuery({
    queryKey: ["blogs", "detail", slug],
    queryFn: () => blogsService.getBlogDetail(slug || ""),
    enabled: Boolean(slug),
  });
}
