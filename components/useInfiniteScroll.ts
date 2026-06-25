// hooks/useInfiniteScroll.ts
import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
  rootMargin = "500px",
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore],
  );

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin,
      threshold,
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, handleObserver, rootMargin, threshold]);

  return loaderRef;
}
