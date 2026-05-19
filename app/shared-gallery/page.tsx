"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Menu, X, Heart, Share2, Download, Play } from "lucide-react";
import { useData } from "@/hooks/useData";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import UploadMemory from "@/components/UploadMemory";

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
  approved: boolean;
}

// ✅ Video Thumbnail Cache with Deduplication
const videoThumbnailCache = new Map<string, Promise<string | null>>();
const generatingVideoThumbnails = new Map<string, Promise<string | null>>();

// ✅ Video Component with Auto-Generated Thumbnail Cover
function VideoWithCover({
  item,
  className,
}: {
  item: GalleryItem;
  className?: string;
}) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  const isSameOriginVideo = useMemo(() => {
    try {
      const videoUrl = new URL(item.url, window.location.href);
      return videoUrl.origin === window.location.origin;
    } catch {
      return false;
    }
  }, [item.url]);

  // Generate thumbnail from video (runs once per video URL)
  useEffect(() => {
    if (!isSameOriginVideo) {
      setIsGeneratingThumbnail(false);
      return;
    }
    // Check cache first
    if (videoThumbnailCache.has(item.url)) {
      videoThumbnailCache.get(item.url)?.then((thumbnail) => {
        setThumbnailUrl(thumbnail);
        setIsGeneratingThumbnail(false);
      });
      return;
    }

    // Deduplicate thumbnail generation requests
    if (generatingVideoThumbnails.has(item.url)) {
      generatingVideoThumbnails.get(item.url)?.then((thumbnail) => {
        setThumbnailUrl(thumbnail);
        setIsGeneratingThumbnail(false);
      });
      return;
    }

    const generationPromise = new Promise<string | null>((resolve) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.preload = "metadata";
      video.muted = true;

      const generateThumbnail = () => {
        try {
          video.currentTime = 1;
        } catch (error) {
          console.error("Failed to seek video:", error);
        }
      };

      const captureThumbnail = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const thumbnail = canvas.toDataURL("image/jpeg", 0.6);
            videoThumbnailCache.set(item.url, Promise.resolve(thumbnail));
            setThumbnailUrl(thumbnail);
            setIsGeneratingThumbnail(false);
            resolve(thumbnail);
          }
        } catch (error) {
          console.error("Failed to capture thumbnail:", error);
          setIsGeneratingThumbnail(false);
          resolve(null);
        }
        video.remove();
        generatingVideoThumbnails.delete(item.url);
      };

      video.addEventListener("loadeddata", generateThumbnail);
      video.addEventListener("seeked", captureThumbnail);
      video.addEventListener("error", () => {
        console.debug(
          "Failed to load video for thumbnail (skipping):",
          item.url,
        );
        setIsGeneratingThumbnail(false);
        resolve(null);
        video.remove();
        generatingVideoThumbnails.delete(item.url);
      });

      video.src = item.url;
      video.load();
    });

    generatingVideoThumbnails.set(item.url, generationPromise);
  }, [item.url]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handlePlayVideo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVideo(true);
    // Small delay to ensure video element is rendered
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current
          .play()
          .catch((err) => console.log("Autoplay prevented:", err));
      }
    }, 100);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 ${className || ""}`}
      onClick={handlePlayVideo}
    >
      {!showVideo ? (
        // Show Cover Image / Thumbnail
        <div className="relative w-full h-full cursor-pointer group">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={item.caption}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : isGeneratingThumbnail ? (
            // Loading skeleton while generating thumbnail
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <div className="w-12 h-12 border-3 border-netflix-red/30 border-t-netflix-red rounded-full animate-spin" />
            </div>
          ) : (
            // Fallback gradient background if thumbnail generation fails
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-netflix-red">
              <Play className="text-white/50" size={48} />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-netflix-red/90 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 group-hover:scale-110 group-hover:bg-netflix-red transition-all duration-300 shadow-lg">
              <Play className="text-white ml-1" size={32} />
            </div>
          </div>
        </div>
      ) : (
        // Show Actual Video
        isInView && (
          <video
            ref={videoRef}
            src={item.url}
            className="w-full h-full object-cover"
            controls
            autoPlay
            playsInline
            onEnded={() => setShowVideo(false)}
          />
        )
      )}
    </div>
  );
}

// ✅ Lazy Image Component with Intersection Observer
function LazyImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-800 ${className || ""}`}
    >
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 animate-pulse" />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-110 transition-transform duration-500`}
        />
      )}
    </div>
  );
}

// ✅ Pagination Hook
function usePagination<T>(items: T[], itemsPerPage: number = 12) {
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

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return loaderRef;
}

export default function SharedGalleryPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false);

  const { data: gallery } = useData<GalleryItem[]>("gallery.json");

  // ✅ ONLY APPROVED ITEMS - Memoized to prevent recalculation
  const approvedGallery = useMemo(
    () => (gallery ?? []).filter((item) => item.approved === true),
    [gallery],
  );

  // ✅ Pagination
  const { visibleItems, hasMore, loadMore, reset, total } = usePagination(
    approvedGallery,
    12,
  );
  const loaderRef = useInfiniteScroll(loadMore, hasMore);

  // Reset pagination when gallery changes
  useEffect(() => {
    reset();
  }, [approvedGallery.length, reset]);

  const handleLike = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const handleShare = useCallback(
    async (item: GalleryItem, e: React.MouseEvent) => {
      e.stopPropagation();
      if (navigator.share) {
        try {
          await navigator.share({
            title: item.caption,
            text: `Check out this memory from ${item.day}`,
            url: item.url,
          });
        } catch (err) {
          console.log("Error sharing:", err);
        }
      } else {
        await navigator.clipboard.writeText(item.url);
        alert("Link copied to clipboard!");
      }
    },
    [],
  );

  const handleDownload = useCallback(
    (item: GalleryItem, e: React.MouseEvent) => {
      e.stopPropagation();
      const link = document.createElement("a");
      link.href = item.url;
      link.download = `memory-${item.id}`;
      link.click();
    },
    [],
  );

  const handleUploadComplete = useCallback(() => {
    setIsUploading(false);
    // Gallery will auto-update via useData hook
  }, []);

  // Memoized gallery item component
  const GalleryItemComponent = useCallback(
    ({ item, index }: { item: GalleryItem; index: number }) => {
      const rotation = (item.id % 7) - 3;

      return (
        <div
          key={item.id}
          className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer overflow-hidden will-change-transform border border-white/10"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDelay: `${(index % 6) * 30}ms`,
          }}
          onClick={() => setSelectedMedia(item)}
        >
          {/* Media */}
          <div className="aspect-[3/4] relative overflow-hidden">
            {item.type === "image" ? (
              <LazyImage
                src={item.url}
                alt={item.caption}
                className="w-full h-full"
              />
            ) : (
              <VideoWithCover item={item} className="w-full h-full" />
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

            {/* Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 will-change-transform">
              <div className="flex justify-between items-center">
                <button
                  onClick={(e) => handleLike(item.id, e)}
                  className={`p-2 rounded-full transition-all duration-200 transform active:scale-90 ${
                    likedItems.has(item.id)
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-white/20 text-white hover:bg-white/30 hover:scale-110"
                  }`}
                  aria-label="Like"
                >
                  <Heart
                    size={16}
                    fill={likedItems.has(item.id) ? "currentColor" : "none"}
                  />
                </button>

                <button
                  onClick={(e) => handleShare(item, e)}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>

                <button
                  onClick={(e) => handleDownload(item, e)}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
                  aria-label="Download"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-black/40 backdrop-blur-sm">
            <p className="text-sm text-white font-medium truncate">
              {item.caption}
            </p>
            <p className="text-xs text-yellow-400">{item.day}</p>
          </div>
        </div>
      );
    },
    [likedItems, handleLike, handleShare, handleDownload],
  );

  return (
    <div className="min-h-screen bg-netflix-dark overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden will-change-transform">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-3xl rounded-full" />
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

      {/* Navigation */}
      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="relative pt-24 px-4 md:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="text-4xl md:text-6xl font-black text-white mb-4"
            >
              Shared Gallery
            </h1>
            <p className="text-netflix-lightgray text-lg max-w-2xl mx-auto">
              Explore memories shared by the community. Like, share, and
              download your favorites.
            </p>

            {/* Stats Counter */}
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="text-yellow-400 font-bold">{total}</span>
              <span className="text-netflix-lightgray text-sm">
                memories shared
              </span>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-10">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Upload a Memory
              </h2>
              <p className="text-netflix-lightgray mb-6">
                Share a new photo or video from the graduation celebration.
              </p>
              <UploadMemory onUploaded={handleUploadComplete} />
              {isUploading && (
                <div className="mt-4 flex items-center gap-3 text-netflix-lightgray">
                  <div className="w-5 h-5 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
          </div>

          {/* Gallery Grid with Pagination */}
          {visibleItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleItems.map((item, index) => (
                  <GalleryItemComponent
                    key={item.id}
                    item={item}
                    index={index}
                  />
                ))}
              </div>

              {/* Infinite Scroll Loader */}
              {hasMore && (
                <div
                  ref={loaderRef}
                  className="flex justify-center items-center py-12"
                >
                  <div className="w-10 h-10 border-3 border-netflix-red/30 border-t-netflix-red rounded-full animate-spin" />
                </div>
              )}

              {/* Load More Button (Fallback) */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 rounded-full bg-netflix-red text-white font-medium hover:bg-netflix-red/80 transition-all duration-300 transform hover:scale-105"
                  >
                    Load More ({visibleItems.length} / {total})
                  </button>
                </div>
              )}
            </>
          ) : (
            /* EMPTY STATE */
            <div className="text-center py-24">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Heart className="text-netflix-lightgray" size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No Memories Yet
              </h3>
              <p className="text-netflix-lightgray text-lg">
                Be the first to share a memory from the graduation celebration!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX */}
      {selectedMedia && (
        <LightBox
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
