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

    // Prevent layout shift when scrollbar disappears
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

  // Progress states
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Reset controls visibility timer
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Show controls on mouse move
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    resetControlsTimer();
  }, [resetControlsTimer]);

  // Toggle play/pause
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

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!video.muted);
  }, []);

  // Toggle fullscreen
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

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || isDragging) return;
    setCurrentTime(video.currentTime);
  }, [isDragging]);

  // Handle metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  }, []);

  // Handle progress
  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
  }, []);

  // Handle seek
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const progressBar = progressBarRef.current;
      const video = videoRef.current;
      if (!progressBar || !video) return;

      const rect = progressBar.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      const newTime = percentage * duration;

      video.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration],
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      handleSeek(e);
    },
    [handleSeek],
  );

  // Handle drag move
  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const progressBar = progressBarRef.current;
      const video = videoRef.current;
      if (!progressBar || !video) return;

      const rect = progressBar.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      const newTime = percentage * duration;

      setCurrentTime(newTime);
    },
    [isDragging, duration],
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const progressBar = progressBarRef.current;
      const video = videoRef.current;
      if (!progressBar || !video) return;

      const rect = progressBar.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      const newTime = percentage * duration;

      video.currentTime = newTime;
      setIsDragging(false);
    },
    [isDragging, duration],
  );

  // Add/remove drag event listeners
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

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard controls for video
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
        case "M":
          toggleMute();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen]);

  // Calculate progress percentages
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercentage = duration > 0 ? (buffered / duration) * 100 : 0;

  if (error) {
    return (
      <div className="flex items-center justify-center w-full aspect-video bg-gray-900 rounded-lg">
        <div className="text-center">
          <Play className="text-gray-500 mx-auto mb-3" size={48} />
          <p className="text-gray-400 text-sm">Failed to load video</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative group w-full aspect-video bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
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
      >
        <track kind="captions" />
      </video>

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200">
            <Play className="text-white fill-white" size={36} />
          </div>
        </div>
      )}

      {/* Video Controls Bar */}
      <div
        className={`
          absolute bottom-0 left-0 right-0
          bg-gradient-to-t from-black/90 via-black/50 to-transparent
          transition-opacity duration-300
          ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}
        `}
      >
        {/* Progress Bar */}
        <div className="px-4 pt-2 pb-1">
          <div
            ref={progressBarRef}
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress hover:h-2.5 transition-all duration-150"
            onClick={handleSeek}
            onMouseDown={handleDragStart}
          >
            {/* Buffered Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
              style={{ width: `${bufferedPercentage}%` }}
            />

            {/* Played Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-netflix-red rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />

            {/* Seek Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-netflix-red rounded-full opacity-0 group-hover/progress:opacity-100 transition-all duration-150 shadow-lg"
              style={{
                left: `calc(${progressPercentage}% - ${progressPercentage > 0 && progressPercentage < 100 ? "7px" : "0px"})`,
                display: progressPercentage === 0 ? "none" : "block",
              }}
            />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-1">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full hover:bg-white/10 transition text-white"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <Pause size={22} />
            ) : (
              <Play size={22} className="fill-white" />
            )}
          </button>

          {/* Time Display */}
          <div className="text-white text-sm font-medium tabular-nums select-none">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/50 mx-1">/</span>
            <span className="text-white/50">{formatTime(duration)}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full hover:bg-white/10 transition text-white"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full hover:bg-white/10 transition text-white"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
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
        absolute ${direction === "left" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2
        p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm
        text-white transition-all duration-200
        hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white
        z-20
      `}
      aria-label={`${direction === "left" ? "Previous" : "Next"} media`}
      disabled={disabled}
    >
      <svg
        className={`w-6 h-6 ${direction === "left" ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
});

// Main LightBox Component
function LightBox({
  media,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: LightBoxProps) {
  // Keyboard navigation
  useLightBoxKeyboard({ onClose, onNext, onPrevious });

  // Body scroll lock
  useBodyScrollLock(true);

  const isImage = media.type === "image" || media.type === "photo";
  const isVideo = media.type === "video";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`${isVideo ? "Video" : "Image"} lightbox: ${media.caption}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="
          absolute top-4 right-4 z-10
          p-3 rounded-full
          bg-black/50 hover:bg-black/70 backdrop-blur-sm
          text-white/80 hover:text-white
          transition-all duration-200
          hover:scale-110
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white
        "
        aria-label="Close lightbox"
      >
        <X size={24} />
      </button>

      {/* Download Button (for images) */}
      {isImage && (
        <a
          href={media.url}
          download
          className="
            absolute top-4 right-20 z-10
            p-3 rounded-full
            bg-black/50 hover:bg-black/70 backdrop-blur-sm
            text-white/80 hover:text-white
            transition-all duration-200
            hover:scale-110
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white
          "
          aria-label="Download media"
          onClick={(e) => e.stopPropagation()}
        >
          <Download size={24} />
        </a>
      )}

      {/* Navigation Arrows */}
      {hasPrevious && (
        <NavigationArrow direction="left" onClick={() => onPrevious?.()} />
      )}
      {hasNext && (
        <NavigationArrow direction="right" onClick={() => onNext?.()} />
      )}

      {/* Content */}
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center">
        {isVideo ? (
          <VideoPlayer url={media.url} />
        ) : isImage ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={media.url}
              alt={media.caption || "Media preview"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 90vw"
              quality={100}
              priority
              onError={(e) => {
                // Fallback for broken images
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>Unsupported media type</p>
          </div>
        )}

        {/* Caption Overlay */}
        {media.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
              {/* Day Badge */}
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold text-white/90 uppercase tracking-wider mb-3">
                {media.day}
              </span>

              {/* Caption */}
              <p className="text-white text-lg md:text-xl font-medium leading-relaxed">
                {media.caption}
              </p>

              {/* Media Type & Student Info */}
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                  {isVideo ? (
                    <>
                      <Play size={14} className="fill-current" />
                      Video
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Photo
                    </>
                  )}
                </span>
                {media.studentId && (
                  <span className="text-sm text-gray-500">
                    • Student #{media.studentId}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(LightBox);
export type { MediaItem, LightBoxProps };
