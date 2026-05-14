"use client";

import Image from "next/image";
import { Play } from "lucide-react";

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

export default function MediaGallery({ gallery, onSelect }: MediaGalleryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {gallery.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="relative group overflow-hidden rounded-lg aspect-square bg-netflix-black border border-netflix-gray/30 hover:border-netflix-red transition focus:outline-none"
        >
          <Image
            src={item.url}
            alt={item.caption}
            fill
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-netflix-black/80 group-hover:to-netflix-black transition" />

          <div className="absolute top-4 left-4 rounded-full bg-netflix-black/70 text-netflix-lightgray text-xs font-semibold uppercase tracking-[0.12em] px-3 py-1">
            {item.day}
          </div>

          {/* Play button for videos */}
          {item.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-100 opacity-60 transition">
              <div className="bg-netflix-red/80 rounded-full p-3 group-hover:bg-netflix-red transition">
                <Play className="text-white fill-white" size={24} />
              </div>
            </div>
          )}

          {/* Caption on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition">
            <p className="text-white text-sm font-medium">{item.caption}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
