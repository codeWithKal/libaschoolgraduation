"use client";

import { useState } from "react";
import { Menu, X, Heart, Share2, Download } from "lucide-react";
import { useData } from "@/hooks/useData";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import LightBox from "@/components/lightbox";
import UploadMemory from "@/components/UploadMemory";

interface GalleryItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
  day: string;
  approved: boolean;
}

export default function SharedGalleryPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const { data: gallery } = useData<GalleryItem[]>("gallery.json");

  // ✅ ONLY APPROVED ITEMS
  const approvedGallery = (gallery ?? []).filter(
    (item) => item.approved === true,
  );

  const handleLike = (id: number) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleShare = async (item: GalleryItem) => {
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
    }
  };

  return (
    <div className="min-h-screen bg-netflix-dark overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
          </div>
          <div className="mb-10">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Upload a Memory
              </h2>
              <p className="text-netflix-lightgray mb-6">
                Share a new photo or video from the graduation celebration.
              </p>
              <UploadMemory onUploaded={() => window.location.reload()} />
            </div>
          </div>
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {approvedGallery?.map((item, index) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:-rotate-1 hover:shadow-2xl cursor-pointer border-2 border-gray-200 overflow-hidden"
                style={{
                  transform: `rotate(${Math.random() * 4 - 2}deg)`,
                }}
                onClick={() => setSelectedMedia(item)}
              >
                {/* Media */}
                <div className="aspect-[3/4] relative">
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.caption}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(item.id);
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          likedItems.has(item.id)
                            ? "bg-red-500 text-white"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        <Heart
                          size={16}
                          fill={
                            likedItems.has(item.id) ? "currentColor" : "none"
                          }
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(item);
                        }}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
                      >
                        <Share2 size={16} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement("a");
                          link.href = item.url;
                          link.download = `memory-${item.id}`;
                          link.click();
                        }}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50">
                  <p className="text-sm text-gray-700 font-medium truncate">
                    {item.caption}
                  </p>
                  <p className="text-xs text-gray-500">{item.day}</p>
                </div>
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {approvedGallery.length === 0 && (
            <div className="text-center py-24">
              <p className="text-netflix-lightgray text-lg">
                No approved media yet.
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
