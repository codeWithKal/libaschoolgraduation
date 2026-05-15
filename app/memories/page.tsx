"use client";

import { useEffect, useState, useRef } from "react";
import Navigation from "@/components/navigation";
import MediaGallery from "@/components/media-gallery";
import LightBox from "@/components/lightbox";
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

interface GalleryItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
  day: string;
  thumbnail?: string; // ✅ Add optional thumbnail URL
}

// ✅ Video Thumbnail Component (with cover image)
function VideoThumbnail({
  item,
  size = "large",
}: {
  item: GalleryItem;
  size?: "large" | "small";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    item.thumbnail || null,
  );
  const [isLoading, setIsLoading] = useState(!item.thumbnail);

  useEffect(() => {
    // If thumbnail is already provided in the data, use it
    if (item.thumbnail) {
      setThumbnailUrl(item.thumbnail);
      setIsLoading(false);
      return;
    }

    // Otherwise, try to generate thumbnail from video
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.muted = true;

    const generateThumbnail = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          setThumbnailUrl(canvas.toDataURL("image/jpeg", 0.7));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to generate thumbnail:", error);
        setIsLoading(false);
      }
    };

    video.addEventListener("loadeddata", () => {
      video.currentTime = 1; // Seek to 1 second
    });

    video.addEventListener("seeked", () => {
      generateThumbnail();
      video.remove();
    });

    video.addEventListener("error", () => {
      setIsLoading(false);
      video.remove();
    });

    video.src = item.url;
    video.load();

    return () => {
      video.remove();
    };
  }, [item.url, item.thumbnail]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black overflow-hidden">
      {/* Cover Image / Thumbnail */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={item.caption}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        /* Fallback placeholder while generating thumbnail */
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-netflix-red/20 animate-pulse flex items-center justify-center">
            <PlayCircle className="text-netflix-red/50" size={32} />
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
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

export default function MemoriesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [selectedDay, setSelectedDay] = useState("Gabi Day");
  const [viewMode, setViewMode] = useState<"grid" | "tiles" | "list">("grid");
  const [mediaFilter, setMediaFilter] = useState<"all" | "images" | "videos">(
    "all",
  );

  const { data: gabiGallery } = useData<GalleryItem[]>("gabi_day.json");
  const { data: crazyGallery } = useData<GalleryItem[]>("crazy_day.json");
  const { data: tripGallery } = useData<GalleryItem[]>("welcome_day.json");

  const days = ["Gabi Day", "Crazy Day", "Welcome Day"];

  const gallery =
    selectedDay === "Gabi Day"
      ? gabiGallery
      : selectedDay === "Crazy Day"
        ? crazyGallery
        : selectedDay === "Welcome Day"
          ? tripGallery
          : [];

  const filteredGallery = gallery?.filter((item) => {
    if (mediaFilter === "all") return true;
    if (mediaFilter === "images") return item.type !== "video";
    if (mediaFilter === "videos") return item.type === "video";
    return true;
  });

  useEffect(() => {
    if (!days.includes(selectedDay)) {
      setSelectedDay("Gabi Day");
    }
  }, [selectedDay]);

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

  return (
    <div className="min-h-screen bg-netflix-dark overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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

      {/* Navigation */}
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
                  <p className="text-white font-bold text-lg">
                    {filteredGallery?.length || 0}
                  </p>
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

          {/* GALLERY */}
          {filteredGallery && filteredGallery.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredGallery.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="group cursor-pointer animate-slide-in-up"
                    style={{ animationDelay: `${(index % 8) * 0.08}s` }}
                  >
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-2 hover:border-netflix-red/40 hover:-translate-y-1 transition-all duration-500 aspect-[4/3]">
                      <div className="relative overflow-hidden rounded-2xl h-full">
                        {item.type === "video" ? (
                          // ✅ Use VideoThumbnail with cover image
                          <VideoThumbnail item={item} size="large" />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.caption}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                        <span className="text-sm text-yellow-300">
                          {selectedDay}
                        </span>
                        <span className="text-xs text-netflix-lightgray uppercase">
                          • {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === "tiles" ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5">
                {filteredGallery.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="group cursor-pointer animate-slide-in-up"
                    style={{ animationDelay: `${(index % 8) * 0.08}s` }}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-2 hover:border-netflix-red/40 hover:-translate-y-1 transition-all duration-500">
                      <div className="relative overflow-hidden rounded-xl aspect-square bg-gradient-to-br from-gray-800 to-gray-900">
                        {item.type === "video" ? (
                          // ✅ Use VideoThumbnail with cover image
                          <VideoThumbnail item={item} size="small" />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.caption}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {filteredGallery.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="group cursor-pointer flex items-center gap-5 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:border-netflix-red/30 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-500 animate-slide-in-up"
                    style={{ animationDelay: `${(index % 8) * 0.08}s` }}
                  >
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900">
                      {item.type === "video" ? (
                        // ✅ Use VideoThumbnail with cover image
                        <VideoThumbnail item={item} size="small" />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.caption}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                        {item.type === "video" ? (
                          <PlayCircle size={12} />
                        ) : (
                          <Images size={12} />
                        )}
                        {item.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
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
