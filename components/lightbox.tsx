"use client";

import Image from "next/image";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Film,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback, memo } from "react";

interface MediaItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
  day: string;
}

interface LightBoxProps {
  media: MediaItem;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Custom hook for keyboard navigation
function useLightBoxKeyboard({
  onClose,
  onNext,
  onPrevious,
}: {
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          if (onNext) onNext();
          break;
        case "ArrowLeft":
          if (onPrevious) onPrevious();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);
}

// Custom hook for body scroll lock
function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}

// Utility function to format time
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Video Player Component
const VideoPlayer = memo(function VideoPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(
        () => setShowControls(false),
        3000,
      );
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    resetControlsTimer();
  }, [resetControlsTimer]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || isDragging) return;
    setCurrentTime(video.currentTime);
  }, [isDragging]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  }, []);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.buffered.length === 0) return;
    setBuffered(video.buffered.end(video.buffered.length - 1));
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const progressBar = progressBarRef.current;
      const video = videoRef.current;
      if (!progressBar || !video || duration === 0) return;

      const rect = progressBar.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      video.currentTime = percentage * duration;
    },
    [duration],
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      handleSeek(e);
    },
    [handleSeek],
  );

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !progressBarRef.current || duration === 0) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      setCurrentTime(percentage * duration);
    },
    [isDragging, duration],
  );

  const handleDragEnd = useCallback(
    (e: MouseEvent) => {
      if (
        !isDragging ||
        !videoRef.current ||
        !progressBarRef.current ||
        duration === 0
      )
        return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      videoRef.current.currentTime = percentage * duration;
      setIsDragging(false);
    },
    [isDragging, duration],
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    }
    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercentage = duration > 0 ? (buffered / duration) * 100 : 0;

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gray-900 rounded-xl">
        <div className="text-center">
          <Film className="text-gray-600 mx-auto mb-3" size={48} />
          <p className="text-gray-500 text-sm">Unable to load video</p>
          <p className="text-gray-600 text-xs mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative group w-full h-full bg-black rounded-xl overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onError={() => setError(true)}
        playsInline
        preload="metadata"
      />

      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200">
            <Play className="text-white fill-white ml-1" size={28} />
          </div>
        </div>
      )}

      <div
        className={`
          absolute bottom-0 left-0 right-0
          bg-gradient-to-t from-black/90 via-black/50 to-transparent
          transition-opacity duration-300
          ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}
        `}
      >
        <div className="px-4 pt-2 pb-1">
          <div
            ref={progressBarRef}
            className="relative h-1 bg-white/20 rounded-full cursor-pointer group/progress hover:h-1.5 transition-all duration-150"
            onClick={handleSeek}
            onMouseDown={handleDragStart}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
              style={{ width: `${bufferedPercentage}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-netflix-red rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-netflix-red rounded-full opacity-0 group-hover/progress:opacity-100 transition-all duration-150 shadow-lg"
              style={{
                left: `calc(${progressPercentage}% - 6px)`,
                display: progressPercentage === 0 ? "none" : "block",
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 pb-3 pt-1">
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full hover:bg-white/10 transition text-white"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="fill-white" />
            )}
          </button>

          <div className="text-white text-xs font-medium tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/40 mx-0.5">/</span>
            <span className="text-white/40">{formatTime(duration)}</span>
          </div>

          <div className="flex-1" />

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full hover:bg-white/10 transition text-white"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full hover:bg-white/10 transition text-white"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
});

// Navigation Arrow Component
const NavigationArrow = memo(function NavigationArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) {
  if (disabled) return null;

  return (
    <button
      onClick={onClick}
      className={`
        absolute ${direction === "left" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2
        p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm
        text-white transition-all duration-200
        hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
        z-20
      `}
      aria-label={`${direction === "left" ? "Previous" : "Next"}`}
    >
      {direction === "left" ? (
        <ChevronLeft size={20} />
      ) : (
        <ChevronRight size={20} />
      )}
    </button>
  );
});

// Main LightBox Component - Modal Size
function LightBox({
  media,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: LightBoxProps) {
  useLightBoxKeyboard({ onClose, onNext, onPrevious });
  useBodyScrollLock(true);

  const isImage = media.type === "image" || media.type === "photo";
  const isVideo = media.type === "video";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`${isVideo ? "Video" : "Image"} viewer: ${media.caption}`}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] bg-black/95 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-3 right-3 z-10
            p-2 rounded-full
            bg-black/60 hover:bg-black/80 backdrop-blur-sm
            text-white/80 hover:text-white
            transition-all duration-200
            hover:scale-110
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
          "
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Download Button */}
        {isImage && (
          <a
            href={media.url}
            download
            className="
              absolute top-3 right-16 z-10
              p-2 rounded-full
              bg-black/60 hover:bg-black/80 backdrop-blur-sm
              text-white/80 hover:text-white
              transition-all duration-200
              hover:scale-110
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
            "
            aria-label="Download"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={18} />
          </a>
        )}

        {/* Navigation Arrows */}
        {hasPrevious && (
          <NavigationArrow direction="left" onClick={() => onPrevious?.()} />
        )}
        {hasNext && (
          <NavigationArrow direction="right" onClick={() => onNext?.()} />
        )}

        {/* Content Area */}
        <div className="relative w-full h-full flex items-center justify-center p-6">
          {isVideo ? (
            <div className="w-full max-h-[70vh]">
              <VideoPlayer url={media.url} />
            </div>
          ) : isImage ? (
            <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
              <Image
                src={media.url}
                alt={media.caption || "Media preview"}
                width={800}
                height={600}
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg"
                quality={90}
                priority
                unoptimized={media.url.startsWith("data:")}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <ImageIcon className="mx-auto mb-3 opacity-50" size={48} />
              <p>Unsupported media type</p>
            </div>
          )}

          {/* Caption Footer */}
          {media.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 rounded-b-2xl">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-semibold text-white/80 uppercase tracking-wider">
                    {media.day}
                  </span>
                  <span className="text-[10px] text-white/50">
                    {isVideo ? "Video" : "Photo"}
                  </span>
                </div>
                <p className="text-white text-sm font-medium leading-relaxed line-clamp-2">
                  {media.caption}
                </p>
                {media.studentId && (
                  <p className="text-white/40 text-xs mt-1">
                    Student #{media.studentId}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(LightBox);
export type { MediaItem, LightBoxProps };
