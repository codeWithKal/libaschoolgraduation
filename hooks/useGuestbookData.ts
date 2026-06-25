// hooks/useGuestbookData.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface GuestbookMessage {
  id: string;
  author_name: string;
  message: string;
  emoji_reaction?: string;
  created_at: string;
  approved: boolean;
}

interface UseGuestbookDataOptions {
  initialPage?: number;
  limit?: number;
  approved?: boolean | "all";
}

export function useGuestbookData(options: UseGuestbookDataOptions = {}) {
  const { initialPage = 1, limit = 20, approved = true } = options;

  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);

  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMessages = useCallback(
    async (pageNum: number, append: boolean = false) => {
      // Prevent duplicate requests
      if (isFetchingRef.current) {
        console.log("Already fetching, skipping...");
        return;
      }

      isFetchingRef.current = true;

      // Cancel previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const offset = (pageNum - 1) * limit;

        // Build the query
        let query = supabase.from("guestbook").select("*", { count: "exact" });

        // Apply approved filter if not "all"
        if (approved !== "all") {
          query = query.eq("approved", approved);
        }

        // Get total count first
        const { count, error: countError } = await query;

        if (countError) {
          throw countError;
        }

        const totalCount = count || 0;
        setTotal(totalCount);

        // Determine if there are more items
        const hasMoreItems = offset + limit < totalCount;
        setHasMore(hasMoreItems);

        // If no items or offset is out of range, return empty array
        if (totalCount === 0 || offset >= totalCount) {
          if (append) {
            // If appending and we get here, there are no more items
            setHasMore(false);
          } else {
            setMessages([]);
          }
          return;
        }

        // Calculate safe range
        const endOffset = Math.min(offset + limit - 1, totalCount - 1);

        // Get paginated data
        let dataQuery = supabase
          .from("guestbook")
          .select(
            "id, author_name, message, emoji_reaction, created_at, approved",
          );

        if (approved !== "all") {
          dataQuery = dataQuery.eq("approved", approved);
        }

        const { data, error: dataError } = await dataQuery
          .order("created_at", { ascending: false })
          .range(offset, endOffset);

        if (dataError) {
          throw dataError;
        }

        const items = (data || []).map((item) => ({
          id: item.id,
          author_name: item.author_name,
          message: item.message,
          emoji_reaction: item.emoji_reaction,
          created_at: item.created_at,
          approved: item.approved,
        }));

        if (append) {
          setMessages((prev) => [...prev, ...items]);
        } else {
          setMessages(items);
        }
      } catch (err: any) {
        // Ignore abort errors
        if (err.name === "AbortError" || err.code === "PGRST103") {
          console.log("Request was cancelled or out of range");
          return;
        }
        console.error("Error fetching guestbook messages:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch messages",
        );
        setHasMore(false);
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [approved, limit],
  );

  // Load more messages
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !isFetchingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage, true);
    }
  }, [loadingMore, hasMore, page, fetchMessages]);

  // Refresh messages
  const refresh = useCallback(() => {
    setPage(initialPage);
    setHasMore(false);
    setMessages([]);
    isFetchingRef.current = false;
    fetchMessages(initialPage, false);
  }, [initialPage, fetchMessages]);

  // Initial load
  useEffect(() => {
    setMessages([]);
    setPage(initialPage);
    setHasMore(false);
    isFetchingRef.current = false;

    // Small delay to ensure cleanup
    const timer = setTimeout(() => {
      fetchMessages(initialPage, false);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [approved, initialPage, fetchMessages]);

  // Real-time subscription for guestbook updates
  useEffect(() => {
    const channel = supabase
      .channel("guestbook-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guestbook",
        },
        (payload) => {
          // Only refresh if there's a relevant change
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE" ||
            payload.eventType === "DELETE"
          ) {
            refresh();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return {
    messages,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    loadMore,
    refresh,
    page,
  };
}
