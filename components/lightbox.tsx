"use client";

import Image from "next/image";
import { X, Play } from "lucide-react";
import { useEffect } from "react";

interface LightBoxProps {
  media: {
    id: number;
    type: string;
    url: string;
    caption: string;
    studentId: number;
    day: string;
  };
  onClose: () => void;
}

export default function LightBox({ media, onClose }: LightBoxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-netflix-black/50 hover:bg-netflix-black text-white transition"
      >
        <X size={24} />
      </button>

      {/* Content */}
      <div className="relative w-full h-full max-w-4xl max-h-screen flex items-center justify-center">
        {media.type === "image" ? (
          <Image
            src={media.url}
            alt={media.caption}
            fill
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="relative w-full aspect-video bg-netflix-black rounded-lg overflow-hidden">
            <video
              src={media.url}
              className="w-full h-full object-contain"
              controls
              autoPlay
            />
          </div>
        )}

        {/* Caption */}
        {media.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-netflix-black to-transparent p-6">
            <div className="mb-2 text-netflix-lightgray text-xs uppercase tracking-[0.2em]">
              {media.day}
            </div>
            <p className="text-white text-lg">{media.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
