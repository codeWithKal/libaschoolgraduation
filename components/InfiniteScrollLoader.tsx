// components/InfiniteScrollLoader.tsx
"use client";

import { useEffect, useRef } from "react";

interface InfiniteScrollLoaderProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  children?: React.ReactNode;
}

export function InfiniteScrollLoader({
  onLoadMore,
  hasMore,
  loading,
  children,
}: InfiniteScrollLoaderProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "500px" },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <>
      {children}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center items-center py-12">
          <div className="w-10 h-10 border-3 border-netflix-red/30 border-t-netflix-red rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
