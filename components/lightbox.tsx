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
  SkipBack,
  SkipForward,
  Settings,
  PictureInPicture,
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
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Professional Video Player Component with Enhanced Controls
const VideoPlayer = memo(function VideoPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const animationRef = useRef<number | undefined>(undefined);

  const isDraggingRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const updateProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || isDraggingRef.current) return;

    const newProgress = (video.currentTime / video.duration) * 100;
    setCurrentTime(video.currentTime);
    setProgress((prev) =>
      Math.abs(prev - newProgress) > 0.1 ? newProgress : prev,
    );
  }, []);

  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !isHovering) {
      controlsTimeoutRef.current = setTimeout(
        () => setShowControls(false),
        2500,
      );
    } else if (isHovering) {
      setShowControls(true);
    }
  }, [isPlaying, isHovering]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    resetControlsTimer();
  }, [resetControlsTimer]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    setShowControls(true);
    resetControlsTimer();
  }, [resetControlsTimer]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(
        () => setShowControls(false),
        1000,
      );
    }
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setShowControls(true);
      resetControlsTimer();
      const update = () => {
        updateProgress();
        animationRef.current = requestAnimationFrame(update);
      };
      animationRef.current = requestAnimationFrame(update);
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [updateProgress, resetControlsTimer]);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration, video.currentTime + seconds),
    );
    setCurrentTime(video.currentTime);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
      setVolume(video.volume);
    }
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video) return;
      const newVolume = parseFloat(e.target.value);
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      if (newVolume > 0 && video.muted) {
        video.muted = false;
        setIsMuted(false);
      }
    },
    [],
  );

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const togglePictureInPicture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPictureInPicture(false);
      } else {
        await video.requestPictureInPicture();
        setIsPictureInPicture(true);
      }
    } catch (error) {
      console.error("Picture-in-picture error:", error);
    }
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setCurrentTime(0);
    setProgress(0);
  }, []);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.buffered.length === 0) return;
    setBufferedEnd(video.buffered.end(video.buffered.length - 1));
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
      setCurrentTime(video.currentTime);
      setProgress(percentage * 100);
    },
    [duration],
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
      handleSeek(e);
    },
    [handleSeek],
  );

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !progressBarRef.current || duration === 0)
        return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      setProgress(percentage * 100);
      setCurrentTime(percentage * duration);
    },
    [duration],
  );

  const handleDragEnd = useCallback(
    (e: MouseEvent) => {
      if (
        !isDraggingRef.current ||
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
      isDraggingRef.current = false;
    },
    [duration],
  );

  // Set up drag event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleMouseUp = (e: MouseEvent) => handleDragEnd(e);

    if (isDraggingRef.current) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleDragMove, handleDragEnd]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle picture-in-picture changes
  useEffect(() => {
    const handlePictureInPictureChange = () => {
      setIsPictureInPicture(!!document.pictureInPictureElement);
    };
    document.addEventListener(
      "enterpictureinpicture",
      handlePictureInPictureChange,
    );
    document.addEventListener(
      "leavepictureinpicture",
      handlePictureInPictureChange,
    );
    return () => {
      document.removeEventListener(
        "enterpictureinpicture",
        handlePictureInPictureChange,
      );
      document.removeEventListener(
        "leavepictureinpicture",
        handlePictureInPictureChange,
      );
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
        case "j":
          e.preventDefault();
          skip(-5);
          break;
        case "ArrowRight":
        case "l":
          e.preventDefault();
          skip(5);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          setIsMuted(video.volume === 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          setIsMuted(video.volume === 0);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "p":
          togglePictureInPicture();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skip, toggleMute, toggleFullscreen, togglePictureInPicture]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Show controls initially
  useEffect(() => {
    setShowControls(true);
    resetControlsTimer();
  }, [resetControlsTimer]);

  const bufferedPercentage = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl">
        <div className="text-center">
          <Film className="text-gray-600 mx-auto mb-3" size={48} />
          <p className="text-gray-400 text-sm font-medium">
            Unable to load video
          </p>
          <p className="text-gray-500 text-xs mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Container - maintains aspect ratio */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={url}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={handleLoadedMetadata}
          onProgress={handleProgress}
          onError={() => setError(true)}
          playsInline
          preload="metadata"
        />
      </div>

      {/* Center Play/Pause Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 pointer-events-none ${
          !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
          <Play className="text-white fill-white ml-1" size={32} />
        </div>
      </div>

      {/* Enhanced Video Controls - Fixed at bottom of container */}
      <div
        className={`
          absolute bottom-0 left-0 right-0
          bg-gradient-to-t from-black/95 via-black/70 to-transparent
          transition-all duration-300
          ${showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
        `}
      >
        {/* Progress Bar */}
        <div className="px-4 pt-3 pb-2">
          <div
            ref={progressBarRef}
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress hover:h-2 transition-all duration-150"
            onClick={handleSeek}
            onMouseDown={handleDragStart}
          >
            {/* Buffered Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full transition-all duration-150"
              style={{ width: `${bufferedPercentage}%` }}
            />
            {/* Playback Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
            {/* Progress Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-all duration-150 shadow-lg ring-2 ring-white/20"
              style={{
                left: `calc(${progress}% - 8px)`,
                display: progress === 0 ? "none" : "block",
              }}
            />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-1 px-4 pb-3 pt-1">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white hover:scale-105"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={20} />
            ) : (
              <Play size={20} className="fill-white" />
            )}
          </button>

          {/* Skip Backward */}
          <button
            onClick={() => skip(-10)}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
            aria-label="Rewind 10 seconds"
          >
            <SkipBack size={18} />
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => skip(10)}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
            aria-label="Forward 10 seconds"
          >
            <SkipForward size={18} />
          </button>

          {/* Time Display */}
          <div className="text-white text-sm font-mono ml-2">
            <span className="font-semibold">{formatTime(currentTime)}</span>
            <span className="text-white/40 mx-1">/</span>
            <span className="text-white/60">{formatTime(duration)}</span>
          </div>

          <div className="flex-1" />

          {/* Volume Control */}
          <div className="relative">
            <button
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>

            {/* Volume Slider */}
            {showVolumeSlider && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-black/90 backdrop-blur-md rounded-lg shadow-xl"
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-32 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-3 
                    [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:hover:scale-125
                    [&::-webkit-slider-thumb]:transition-transform"
                />
              </div>
            )}
          </div>

          {/* Playback Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
              aria-label="Playback speed"
            >
              <Settings size={18} />
            </button>

            {showSpeedMenu && (
              <div
                className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden min-w-[120px]"
                onMouseLeave={() => setShowSpeedMenu(false)}
              >
                {playbackRates.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`w-full px-4 py-2 text-sm text-left transition-colors hover:bg-white/10 ${
                      playbackRate === rate
                        ? "text-red-400 font-semibold"
                        : "text-white/80"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Picture in Picture */}
          {typeof window !== "undefined" &&
            document.pictureInPictureEnabled && (
              <button
                onClick={togglePictureInPicture}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
                aria-label="Picture in picture"
              >
                <PictureInPicture size={18} />
              </button>
            )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
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
        p-3 rounded-full
        bg-black/60 hover:bg-black/80 backdrop-blur-md
        text-white transition-all duration-200
        hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
        z-20 shadow-lg
      `}
      aria-label={`${direction === "left" ? "Previous" : "Next"}`}
    >
      {direction === "left" ? (
        <ChevronLeft size={24} />
      ) : (
        <ChevronRight size={24} />
      )}
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
  useLightBoxKeyboard({ onClose, onNext, onPrevious });
  useBodyScrollLock(true);

  const isImage = media.type === "image" || media.type === "photo";
  const isVideo = media.type === "video";

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${isVideo ? "Video" : "Image"} viewer: ${media.caption}`}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-6xl max-h-[90vh] bg-black/95 rounded-2xl shadow-2xl overflow-hidden border border-white/10"
        onClick={handleModalClick}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 z-10
            p-2.5 rounded-full
            bg-black/60 hover:bg-black/80 backdrop-blur-md
            text-white/80 hover:text-white
            transition-all duration-200
            hover:scale-110
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
            shadow-lg
          "
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Download Button */}
        {isImage && (
          <a
            href={media.url}
            download
            className="
              absolute top-4 right-20 z-10
              p-2.5 rounded-full
              bg-black/60 hover:bg-black/80 backdrop-blur-md
              text-white/80 hover:text-white
              transition-all duration-200
              hover:scale-110
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
              shadow-lg
            "
            aria-label="Download"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={20} />
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
            <div className="w-full h-full min-h-[500px]">
              <VideoPlayer url={media.url} />
            </div>
          ) : isImage ? (
            <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
              <Image
                src={media.url}
                alt={media.caption || "Media preview"}
                width={1200}
                height={800}
                className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                quality={95}
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
              <p className="text-gray-400">Unsupported media type</p>
            </div>
          )}

          {/* Caption Footer */}
          {media.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 rounded-b-2xl pointer-events-none">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white/90 uppercase tracking-wider">
                    {media.day}
                  </span>
                  <span className="text-xs text-white/50 font-mono">
                    {isVideo ? "VIDEO" : "PHOTO"}
                  </span>
                </div>
                <p className="text-white text-base font-medium leading-relaxed line-clamp-2">
                  {media.caption}
                </p>
                {media.studentId && (
                  <p className="text-white/40 text-sm mt-2 font-mono">
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
