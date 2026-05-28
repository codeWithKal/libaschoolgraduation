"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Navigation from "@/components/navigation";
import UploadMemory from "@/components/UploadMemory";
import Footer from "@/components/footer";
import { useData } from "@/hooks/useData";
import {
  Menu,
  X,
  LayoutGrid,
  Grid2X2,
  Rows3,
  Sparkles,
  Images,
  PlayCircle,
  Filter,
} from "lucide-react";

// Lazy load heavy component
const LightBox = dynamic(() => import("@/components/lightbox"), {
  loading: () => null,
  ssr: false,
});

interface GalleryItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
  day: string;
  thumbnail?: string;
}

// ✅ Optimized Lazy Image Component
function LazyImage({
  src,
  alt,
  className,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black animate-pulse" />
      )}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`${className} object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-110 transition-transform duration-500`}
        />
      )}
    </div>
  );
}

// ✅ Optimized Video Thumbnail - No generation on load
function VideoThumbnail({
  item,
  size = "large",
  onVideoClick,
}: {
  item: GalleryItem;
  size?: "large" | "small";
  onVideoClick: () => void;
}) {
  // Use provided thumbnail if available, otherwise show placeholder
  const hasThumbnail = !!item.thumbnail;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onVideoClick();
      }}
      className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black overflow-hidden cursor-pointer group"
    >
      {hasThumbnail ? (
        <img
          src={item.thumbnail}
          alt={item.caption}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center p-4">
            <PlayCircle
              className="text-netflix-red/40 mx-auto mb-2"
              size={40}
            />
            <p className="text-netflix-lightgray text-xs">Click to play</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 group-hover:bg-black/0 transition-all duration-300">
        <div
          className={`
            rounded-full bg-netflix-red/90 backdrop-blur-sm flex items-center justify-center 
            border-2 border-white/30 group-hover:scale-110 group-hover:bg-netflix-red 
            transition-all duration-300 shadow-lg
            ${size === "large" ? "w-16 h-16" : "w-10 h-10"}
          `}
        >
          <PlayCircle
            className="text-white"
            size={size === "large" ? 32 : 20}
          />
        </div>
      </div>
    </div>
  );
}

// ✅ Pagination Hook
function usePagination<T>(items: T[], itemsPerPage: number = 20) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const [hasMore, setHasMore] = useState(items.length > itemsPerPage);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const newCount = Math.min(prev + itemsPerPage, items.length);
      setHasMore(newCount < items.length);
      return newCount;
    });
  }, [items.length, itemsPerPage]);

  const reset = useCallback(() => {
    setVisibleCount(itemsPerPage);
    setHasMore(items.length > itemsPerPage);
  }, [items.length, itemsPerPage]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  return { visibleItems, hasMore, loadMore, reset, total: items.length };
}

// ✅ Infinite Scroll Hook
function useInfiniteScroll(loadMore: () => void, hasMore: boolean) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "500px" },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
      observer.disconnect();
    };
  }, [loadMore, hasMore]);

  return loaderRef;
}

export default function MemoriesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [selectedDay, setSelectedDay] = useState("Gabi Day");
  const [viewMode, setViewMode] = useState<"grid" | "tiles" | "list">("grid");
  const [mediaFilter, setMediaFilter] = useState<"all" | "images" | "videos">(
    "all",
  );

  const { data: gabiGallery } = useData<GalleryItem[]>("gabi_day.json");
  const { data: crazyGallery } = useData<GalleryItem[]>("photoshot_day.json");
  const { data: welcomeGallery } = useData<GalleryItem[]>("welcome_day.json");

  const days = ["Gabi Day", "Photoshoot Day", "Welcome Day"];

  const gallery = useMemo(() => {
    const dayFolderMap: Record<string, string> = {
      "Gabi Day": "/images/gabi_day",
      "Photoshoot Day": "/images/photoshot_day",
      "Welcome Day": "/images/welcome_day",
    };

    const selectedItems =
      selectedDay === "Gabi Day"
        ? gabiGallery
        : selectedDay === "Photoshoot Day"
          ? crazyGallery
          : selectedDay === "Welcome Day"
            ? welcomeGallery
            : [];

    const currentFolder = dayFolderMap[selectedDay] ?? "";

    return (
      selectedItems?.map((item) => {
        if (!currentFolder || item.url.startsWith(currentFolder)) return item;

        const fileName = item.url.split("/").pop();
        return fileName
          ? { ...item, url: `${currentFolder}/${fileName}` }
          : item;
      }) ?? []
    );
  }, [selectedDay, gabiGallery, crazyGallery, welcomeGallery]);

  const filteredGallery = useMemo(() => {
    if (!gallery) return [];
    return gallery.filter((item) => {
      if (mediaFilter === "all") return true;
      if (mediaFilter === "images") return item.type !== "video";
      if (mediaFilter === "videos") return item.type === "video";
      return true;
    });
  }, [gallery, mediaFilter]);

  const { visibleItems, hasMore, loadMore, reset, total } = usePagination(
    filteredGallery,
    24,
  );

  // Reset pagination when filters change
  useEffect(() => {
    reset();
  }, [selectedDay, mediaFilter, reset]);

  const loaderRef = useInfiniteScroll(loadMore, hasMore);

  const viewOptions = [
    { key: "grid", label: "Grid", icon: LayoutGrid },
    { key: "tiles", label: "Tiles", icon: Grid2X2 },
    { key: "list", label: "List", icon: Rows3 },
  ] as const;

  const filterOptions = [
    { key: "all", label: "All", icon: Filter },
    { key: "images", label: "Pictures", icon: Images },
    { key: "videos", label: "Videos", icon: PlayCircle },
  ] as const;

  // Handle media click - opens lightbox for all media types
  const handleMediaClick = useCallback((item: GalleryItem) => {
    setSelectedMedia(item);
  }, []);

  // Render item based on type and view mode
  const renderItem = useCallback(
    (item: GalleryItem, index: number) => {
      const isVideo = item.type === "video";

      if (viewMode === "tiles") {
        return (
          <div
            key={`${item.id}-${index}`}
            className="group cursor-pointer animate-slide-in-up"
            style={{ animationDelay: `${(index % 8) * 0.05}s` }}
            onClick={() => handleMediaClick(item)}
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-2 hover:border-netflix-red/40 hover:-translate-y-1 transition-all duration-500">
              <div className="relative overflow-hidden rounded-xl aspect-square bg-gradient-to-br from-gray-800 to-gray-900">
                {isVideo ? (
                  <VideoThumbnail
                    item={item}
                    size="small"
                    onVideoClick={() => handleMediaClick(item)}
                  />
                ) : (
                  <LazyImage
                    src={item.url}
                    alt={item.caption}
                    className="w-full h-full"
                    onClick={() => handleMediaClick(item)}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm font-semibold text-white truncate">
                {item.caption}
              </p>
              <p className="text-xs text-netflix-lightgray uppercase">
                {item.type}
              </p>
            </div>
          </div>
        );
      }

      if (viewMode === "list") {
        return (
          <div
            key={`${item.id}-${index}`}
            className="group cursor-pointer flex items-center gap-5 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:border-netflix-red/30 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-500 animate-slide-in-up"
            style={{ animationDelay: `${(index % 8) * 0.05}s` }}
            onClick={() => handleMediaClick(item)}
          >
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900">
              {isVideo ? (
                <VideoThumbnail
                  item={item}
                  size="small"
                  onVideoClick={() => handleMediaClick(item)}
                />
              ) : (
                <LazyImage
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full"
                  onClick={() => handleMediaClick(item)}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-xl mb-2 group-hover:text-netflix-red transition">
                {item.caption}
              </h3>
              <p className="text-yellow-300 text-sm font-medium mb-2">
                {selectedDay}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs uppercase text-netflix-lightgray">
                {isVideo ? <PlayCircle size={12} /> : <Images size={12} />}
                {item.type}
              </div>
            </div>
          </div>
        );
      }

      // Default grid view
      return (
        <div
          key={`${item.id}-${index}`}
          className="group cursor-pointer animate-slide-in-up"
          style={{ animationDelay: `${(index % 8) * 0.05}s` }}
          onClick={() => handleMediaClick(item)}
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-2 hover:border-netflix-red/40 hover:-translate-y-1 transition-all duration-500 aspect-[4/3]">
            <div className="relative overflow-hidden rounded-2xl h-full">
              {isVideo ? (
                <VideoThumbnail
                  item={item}
                  size="large"
                  onVideoClick={() => handleMediaClick(item)}
                />
              ) : (
                <LazyImage
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full"
                  onClick={() => handleMediaClick(item)}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-white font-bold text-lg mb-1 group-hover:text-netflix-red transition truncate">
              {item.caption}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-yellow-300">{selectedDay}</span>
              <span className="text-xs text-netflix-lightgray uppercase">
                • {item.type}
              </span>
            </div>
          </div>
        </div>
      );
    },
    [viewMode, selectedDay, handleMediaClick],
  );

  return (
    <div className="min-h-screen bg-netflix-dark overflow-hidden">
      {/* Background Glow - Optimized with will-change */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden will-change-transform">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-netflix-red/10 blur-3xl rounded-full" />
      </div>

      {/* Mobile Menu */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 text-white hover:bg-black/70 transition-all duration-300"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="relative pt-24 px-4 md:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="relative mb-14">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm font-medium mb-6">
              <Sparkles size={16} />
              Graduation Gallery
            </div>

            <h1
              style={{ fontFamily: "var(--font-elegant)" }}
              className="text-5xl md:text-7xl font-black text-white leading-tight mb-6"
            >
              Shared
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-netflix-red">
                Memories
              </span>
            </h1>

            <p className="max-w-3xl text-lg md:text-xl text-netflix-lightgray leading-relaxed">
              Relive unforgettable graduation moments, celebrations, trips, and
              experiences shared by the NOVAREING batch.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="w-11 h-11 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                  <Images className="text-yellow-400" size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{total}</p>
                  <p className="text-netflix-lightgray text-sm">Memories</p>
                </div>
              </div>
            </div>
          </div>

          {/* FILTER PANEL */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-netflix-red/5" />
            <div className="relative">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                <div className="flex flex-wrap gap-3">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedDay === day
                          ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 scale-105"
                          : "bg-black/40 border border-white/10 text-netflix-lightgray hover:border-yellow-400/30 hover:text-white"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/40 border border-white/10 w-fit">
                  {viewOptions.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.key}
                        onClick={() => setViewMode(mode.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          viewMode === mode.key
                            ? "bg-netflix-red text-white shadow-lg shadow-netflix-red/30"
                            : "text-netflix-lightgray hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon size={16} />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Filter size={16} className="text-netflix-lightgray" />
                  <span className="text-netflix-lightgray text-sm font-medium">
                    Filter by type:
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {filterOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.key}
                        onClick={() => setMediaFilter(option.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          mediaFilter === option.key
                            ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30"
                            : "bg-black/40 border border-white/10 text-netflix-lightgray hover:border-yellow-400/30 hover:text-white"
                        }`}
                      >
                        <Icon size={16} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* GALLERY - With Pagination & Lazy Loading */}
          {visibleItems && visibleItems.length > 0 ? (
            <>
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {visibleItems.map((item, index) => renderItem(item, index))}
                </div>
              )}

              {viewMode === "tiles" && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5">
                  {visibleItems.map((item, index) => renderItem(item, index))}
                </div>
              )}

              {viewMode === "list" && (
                <div className="space-y-5">
                  {visibleItems.map((item, index) => renderItem(item, index))}
                </div>
              )}

              {/* Infinite Scroll Loader */}
              {hasMore && (
                <div
                  ref={loaderRef}
                  className="flex justify-center items-center py-12"
                >
                  <div className="w-10 h-10 border-3 border-netflix-red/30 border-t-netflix-red rounded-full animate-spin" />
                </div>
              )}

              {/* Loading indicator for remaining items */}
              {visibleItems.length < total && !hasMore && (
                <div className="text-center py-12">
                  <p className="text-netflix-lightgray">
                    Showing {visibleItems.length} of {total} memories
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Images className="text-netflix-lightgray" size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No Memories Yet
              </h3>
              <p className="text-netflix-lightgray text-lg">
                No {mediaFilter !== "all" ? mediaFilter : ""} memories available
                for {selectedDay}.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedMedia && (
        <LightBox
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      <Footer />
    </div>
  );
}
