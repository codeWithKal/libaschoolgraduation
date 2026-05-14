"use client";

import { useEffect, useState } from "react";

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
} from "lucide-react";

interface GalleryItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
  day: string;
}

export default function MemoriesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);

  const [selectedDay, setSelectedDay] = useState("Gabi Day");

  const [viewMode, setViewMode] = useState<"grid" | "tiles" | "list">("grid");

  const { data: gabiGallery } = useData<GalleryItem[]>("gabi_day.json");

  const { data: crazyGallery } = useData<GalleryItem[]>("crazy_day.json");

  const { data: tripGallery } = useData<GalleryItem[]>("trip_day.json");

  const days = ["Gabi Day", "Crazy Day", "Trip Day"];

  const gallery =
    selectedDay === "Gabi Day"
      ? gabiGallery
      : selectedDay === "Crazy Day"
        ? crazyGallery
        : selectedDay === "Trip Day"
          ? tripGallery
          : [];

  useEffect(() => {
    if (!days.includes(selectedDay)) {
      setSelectedDay("Gabi Day");
    }
  }, [selectedDay]);

  const viewOptions = [
    {
      key: "grid",
      label: "Grid",
      icon: LayoutGrid,
    },
    {
      key: "tiles",
      label: "Tiles",
      icon: Grid2X2,
    },
    {
      key: "list",
      label: "List",
      icon: Rows3,
    },
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
          className="
            p-3 rounded-2xl
            bg-black/50 backdrop-blur-xl
            border border-white/10
            text-white
            hover:bg-black/70
            transition-all duration-300
          "
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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm font-medium mb-6">
              <Sparkles size={16} />
              Graduation Gallery
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: "var(--font-elegant)",
              }}
              className="
                text-5xl md:text-7xl
                font-black
                text-white
                leading-tight
                mb-6
              "
            >
              Shared
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-netflix-red">
                Memories
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-3xl text-lg md:text-xl text-netflix-lightgray leading-relaxed">
              Relive unforgettable graduation moments, celebrations, trips, and
              experiences shared by the NOVAREING batch.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="w-11 h-11 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                  <Images className="text-yellow-400" size={20} />
                </div>

                <div>
                  <p className="text-white font-bold text-lg">
                    {gallery?.length || 0}
                  </p>

                  <p className="text-netflix-lightgray text-sm">Memories</p>
                </div>
              </div>
            </div>
          </div>

          {/* FILTER PANEL */}
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              border border-white/10
              bg-white/5 backdrop-blur-2xl
              p-6 md:p-8
              mb-10
            "
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-netflix-red/5" />

            <div className="relative">
              {/* DAY TABS */}
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                {/* Days */}
                <div className="flex flex-wrap gap-3">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`
                        px-5 py-2.5 rounded-full
                        text-sm font-medium
                        transition-all duration-300
                        ${
                          selectedDay === day
                            ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 scale-105"
                            : "bg-black/40 border border-white/10 text-netflix-lightgray hover:border-yellow-400/30 hover:text-white"
                        }
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/40 border border-white/10 w-fit">
                  {viewOptions.map((mode) => {
                    const Icon = mode.icon;

                    return (
                      <button
                        key={mode.key}
                        onClick={() => setViewMode(mode.key)}
                        className={`
                          flex items-center gap-2
                          px-4 py-2 rounded-xl
                          text-sm font-medium
                          transition-all duration-300
                          ${
                            viewMode === mode.key
                              ? "bg-netflix-red text-white shadow-lg shadow-netflix-red/30"
                              : "text-netflix-lightgray hover:bg-white/5 hover:text-white"
                          }
                        `}
                      >
                        <Icon size={16} />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Description */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-netflix-lightgray text-lg">
                  Celebrations from{" "}
                  <span className="text-white font-bold">{selectedDay}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* GALLERY */}
          {gallery && gallery.length > 0 ? (
            viewMode === "grid" ? (
              /* GRID VIEW */
              <MediaGallery
                gallery={gallery}
                onSelect={(item) => setSelectedMedia(item)}
              />
            ) : viewMode === "tiles" ? (
              /* TILES VIEW */
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5">
                {gallery.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="
                      group cursor-pointer
                      animate-slide-in-up
                    "
                    style={{
                      animationDelay: `${(index % 8) * 0.08}s`,
                    }}
                  >
                    <div
                      className="
                        relative overflow-hidden
                        rounded-2xl
                        border border-white/10
                        bg-white/5
                        backdrop-blur-xl
                        p-2
                        hover:border-netflix-red/40
                        hover:-translate-y-1
                        transition-all duration-500
                      "
                    >
                      <div className="relative overflow-hidden rounded-xl">
                        {item.type === "video" ? (
                          <>
                            <video
                              src={item.url}
                              className="
                                w-full aspect-square object-cover
                                group-hover:scale-110
                                transition-transform duration-500
                              "
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur flex items-center justify-center border border-white/10">
                                <PlayCircle className="text-white" size={24} />
                              </div>
                            </div>
                          </>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.caption}
                            className="
                              w-full aspect-square object-cover
                              group-hover:scale-110
                              transition-transform duration-500
                            "
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
              /* LIST VIEW */
              <div className="space-y-5">
                {gallery.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="
                      group cursor-pointer
                      flex items-center gap-5
                      rounded-[2rem]
                      border border-white/10
                      bg-white/5 backdrop-blur-xl
                      p-5
                      hover:border-netflix-red/30
                      hover:bg-white/[0.07]
                      hover:-translate-y-1
                      transition-all duration-500
                      animate-slide-in-up
                    "
                    style={{
                      animationDelay: `${(index % 8) * 0.08}s`,
                    }}
                  >
                    {/* Preview */}
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                      {item.type === "video" ? (
                        <>
                          <video
                            src={item.url}
                            className="
                              w-full h-full object-cover
                              group-hover:scale-110
                              transition-transform duration-500
                            "
                          />

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center border border-white/10">
                              <PlayCircle className="text-white" size={20} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.caption}
                          className="
                            w-full h-full object-cover
                            group-hover:scale-110
                            transition-transform duration-500
                          "
                        />
                      )}
                    </div>

                    {/* Content */}
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
            /* EMPTY STATE */
            <div className="text-center py-24">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Images className="text-netflix-lightgray" size={36} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                No Memories Yet
              </h3>

              <p className="text-netflix-lightgray text-lg">
                No memories available for {selectedDay}.
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
