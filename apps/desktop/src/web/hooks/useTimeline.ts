import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const LIMIT = 20;

export function useTimeline() {
  return useInfiniteQuery({
    queryKey: ["notes", "timeline"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await api.notes.$get({
        query: {
          limit: LIMIT.toString(),
          offset: pageParam.toString(),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch notes");
      }

      return res.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LIMIT) {
        return undefined;
      }
      return allPages.length * LIMIT;
    },
  });
}
