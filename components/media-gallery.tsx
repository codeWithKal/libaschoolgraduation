"use client";

import Image from "next/image";
import { Play, ImageIcon, Film } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

interface GalleryItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
  day: string;
}

interface MediaGalleryProps {
  gallery: GalleryItem[];
  onSelect: (item: GalleryItem) => void;
}

interface MediaItemProps {
  item: GalleryItem;
  onSelect: (item: GalleryItem) => void;
}

// Video Placeholder Component
const VideoPlaceholder = memo(function VideoPlaceholder() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <Film className="text-gray-500 mx-auto mb-3" size={36} />
        <div className="w-14 h-14 rounded-full bg-netflix-red/90 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 shadow-lg mx-auto">
          <Play className="text-white fill-white" size={24} />
        </div>
        <p className="text-xs text-gray-400 mt-3 font-medium uppercase tracking-wider">
          Video
        </p>
      </div>
    </div>
  );
});

// Individual Media Item Component
const MediaItem = memo(function MediaItem({ item, onSelect }: MediaItemProps) {
  const handleClick = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(item);
      }
    },
    [item, onSelect],
  );

  const isVideo = item.type === "video";

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="
        relative group overflow-hidden rounded-2xl aspect-square
        bg-gray-900 border border-white/10
        hover:border-netflix-red/50 hover:shadow-lg hover:shadow-netflix-red/10
        focus:outline-none focus-visible:ring-2 focus-visible:ring-netflix-red focus-visible:ring-offset-2 focus-visible:ring-offset-netflix-dark
        transition-all duration-300 ease-out
        transform hover:-translate-y-1
      "
      aria-label={`${isVideo ? "Video" : "Photo"}: ${item.caption}`}
      role="button"
      tabIndex={0}
    >
      {/* Media Content */}
      {isVideo ? (
        <VideoPlaceholder />
      ) : (
        <Image
          src={item.url}
          alt={item.caption}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
          quality={85}
          onError={(e) => {
            // Fallback for broken images
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.classList.add("bg-gray-800");
              // Could add a broken image icon here if needed
            }
          }}
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Day Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-xs font-semibold text-white/90 uppercase tracking-wider">
          {item.day}
        </span>
      </div>

      {/* Media Type Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-xs font-medium text-white/75">
          {isVideo ? (
            <>
              <Play size={12} className="fill-current" />
              <span>Video</span>
            </>
          ) : (
            <>
              <ImageIcon size={12} />
              <span>Photo</span>
            </>
          )}
        </span>
      </div>

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
        <p className="text-white text-sm font-medium leading-tight line-clamp-2">
          {item.caption}
        </p>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-t from-netflix-red/5 via-transparent to-transparent" />
    </button>
  );
});

// Main MediaGallery Component
export default function MediaGallery({ gallery, onSelect }: MediaGalleryProps) {
  // Memoize the sorted/filtered gallery if needed
  const processedGallery = useMemo(() => {
    return gallery;
  }, [gallery]);

  if (!processedGallery || processedGallery.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="text-gray-500" size={24} />
        </div>
        <p className="text-gray-400 text-lg">No media items available</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      role="list"
      aria-label="Media gallery"
    >
      {processedGallery.map((item) => (
        <div key={item.id} role="listitem">
          <MediaItem item={item} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}
