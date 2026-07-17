"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  X,
  AlignLeft,
} from "lucide-react";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  audioLevel: number;
  isPlaying: boolean;
  togglePlay: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  currentTime: number;
  duration: number;
  progress: number;
  seekTo: (time: number) => void;
  showController: boolean;
  toggleController: () => void;
  closeController: () => void;
  showLyrics: boolean;
  toggleLyrics: () => void;
  currentLyric: string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

interface AudioProviderProps {
  children: ReactNode;
}

// Lyrics data with timestamps (in seconds) - Amharic lyrics
const lyricsData = [
  { time: 12.72, text: "ዓይኔ ላይ ነው" },
  { time: 14.62, text: "ዓይኔ ላይ ነው" },
  { time: 18.58, text: "መቼም አይረሳኝም" },
  { time: 25.16, text: "ያ የሚያምረው ጊዜያችን የማይጠገበው" },
  { time: 31.34, text: "ተነግሮ የማያልቀው" },
  { time: 35.67, text: "ትዝታው ሁሌም የማይጠፋ" },
  { time: 40.52, text: "ከኛው ጋር የሚኖር መቼም የማንረሳው" },
  { time: 47.16, text: "ፍፁም ደስታችን ሳቅ ጨዋታችን ጓደኝነታችን" },
  { time: 55.58, text: "ያ ንጹህ ጣፋጭ ፍቅራችን" },
  { time: 58.46, text: "ሁሌም ሳስበው ለኔ ይገርመኛል" },
  { time: 64.45, text: "ያ ልዩ ጊዜ ዛሬም ድረስ ይታወሰኛል" },
  { time: 70.13, text: "ዓይኔ ላይ ነው" },
  { time: 71.84, text: "ያደረግነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 74.5, text: "የሆነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 78.28, text: "መቼም አይረሳኝም አ አ አ" },
  { time: 81.85, text: "ዓይኔ ላይ ነው" },
  { time: 83.59, text: "ያደረግነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 86.23, text: "የሆነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 89.68, text: "መቼም አይረሳኝም አ አ አ" },
  { time: 105.51, text: "ትዝታ መቼም ሃይለኛ ነው" },
  { time: 120.96, text: "እሱ ሁሌም ሃይለኛ ነው" },
  { time: 124.55, text: "ማን ያስቀረዋል" },
  { time: 128.97, text: "ያለፈው ጊዜ መስታወት ሆኖ" },
  { time: 133.02, text: "ዛሬ ላይ አምጥቶን ስንቱን ያሳያል" },
  { time: 140.25, text: "ፍፁም ደስታችን ሳቅ ጨዋታችን ጓደኝነታችን" },
  { time: 148.73, text: "ያ ንጹህ ጣፋጭ ፍቅራችን" },
  { time: 151.82, text: "ሁሌም ሳስበው ለኔ ይገርመኛል" },
  { time: 157.74, text: "ያ ልዩ ጊዜ ዛሬም ድረስ ይታወሰኛል" },
  { time: 163.3, text: "ዓይኔ ላይ ነው" },
  { time: 165.5, text: "ያደረግነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 168.11, text: "የሆነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 171.42, text: "መቼም አይረሳኝም አ አ አ" },
  { time: 175.03, text: "ዓይኔ ላይ ነው" },
  { time: 177.49, text: "ያደረግነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 179.78, text: "የሆነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 182.97, text: "መቼም አይረሳኝም አ አ አ" },
  { time: 210.35, text: "ጊዜ ላይመለስ እየገሰገሰ" },
  { time: 216.1, text: "ትዝታ ብቻዉን ይኸው ነገሠ" },
  { time: 222.03, text: "ባለፈው ጊዜ ፍቅርን ዘርተናል" },
  { time: 227.74, text: "ዛሬም ሳስታውሰው ደስ ይለኛል" },
  { time: 233.76, text: "ዓይኔ ላይ ነው" },
  { time: 235.59, text: "ያደረግነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 238.18, text: "የሆነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 241.4, text: "መቼም አይረሳኝም አ አ አ" },
  { time: 245.29, text: "ዓይኔ ላይ ነው" },
  { time: 247.46, text: "ያደረግነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 250.14, text: "የሆነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 253.69, text: "መቼም አይረሳኝም አ አ አ" },
  { time: 257.19, text: "ዓይኔ ላይ ነው" },
  { time: 259.43, text: "ያደረግነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 262.1, text: "የሆነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 265.37, text: "መቼም አይረሳኝም አ አ አ" },
  { time: 268.89, text: "ዓይኔ ላይ ነው" },
  { time: 270.97, text: "ያደረግነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 273.49, text: "የሆነው ሁሉ ዓይኔ ላይ ነው" },
  { time: 277.14, text: "መቼም አይረሳኝም አ አ አ" },
];

export function AudioProvider({ children }: AudioProviderProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showController, setShowController] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentLyric, setCurrentLyric] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const isDraggingRef = useRef(false);

  // Initialize audio only once
  useEffect(() => {
    if (typeof window === "undefined" || isInitializedRef.current) return;

    isInitializedRef.current = true;

    // Create audio element
    audioRef.current = new Audio("/music/music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    audioRef.current.crossOrigin = "anonymous";

    // Load audio
    audioRef.current.load();

    // Set up AudioContext for visualizer
    const setupAudioContext = () => {
      if (audioRef.current && !audioContextRef.current) {
        try {
          const audioContext = new (
            window.AudioContext || (window as any).webkitAudioContext
          )();
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;

          const source = audioContext.createMediaElementSource(
            audioRef.current,
          );
          source.connect(analyser);
          analyser.connect(audioContext.destination);

          audioContextRef.current = analyser;

          // Start visualizer loop
          updateVisualizer();
        } catch (error) {
          console.error("Error setting up audio context:", error);
        }
      }
    };

    // Try to play when user interacts
    const handleUserInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setupAudioContext();
          })
          .catch(() => {});
      }
      // Remove listeners after first interaction
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current = null;
      }
    };
  }, []);

  // Update visualizer data
  const updateVisualizer = () => {
    if (audioContextRef.current) {
      const dataArray = new Uint8Array(
        audioContextRef.current.frequencyBinCount,
      );
      audioContextRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalized = average / 255;
      setAudioLevel(normalized);

      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    }
  };

  // Update time and progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isDraggingRef.current) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
        setProgress((audio.currentTime / (audio.duration || 1)) * 100);

        // Update lyrics based on current time
        updateLyrics(audio.currentTime);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration || 0);
    });

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", () => {});
    };
  }, []);

  // Update lyrics based on current time
  const updateLyrics = (time: number) => {
    let currentLyricText = "";
    for (let i = lyricsData.length - 1; i >= 0; i--) {
      if (time >= lyricsData[i].time) {
        currentLyricText = lyricsData[i].text;
        break;
      }
    }
    setCurrentLyric(currentLyricText);
  };

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync isMuted with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Toggle mute/unmute
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (!newMutedState) {
      // Unmuting - ensure audio is playing
      if (audioRef.current && !isPlaying) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {});
      }
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {});
      }
    }
  };

  // Seek to position
  const seekTo = (time: number) => {
    if (audioRef.current && duration > 0) {
      const newTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress((newTime / duration) * 100);
      updateLyrics(newTime);
    }
  };

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle controller visibility
  const toggleController = () => {
    setShowController(!showController);
  };

  const closeController = () => {
    setShowController(false);
  };

  // Toggle lyrics visibility
  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  return (
    <AudioContext.Provider
      value={{
        isMuted,
        toggleMute,
        audioLevel,
        isPlaying,
        togglePlay,
        volume,
        setVolume,
        currentTime,
        duration,
        progress,
        seekTo,
        showController,
        toggleController,
        closeController,
        showLyrics,
        toggleLyrics,
        currentLyric,
      }}
    >
      {children}

      {/* Audio Controller - Expanded View */}
      {showController && (
        <div className="fixed bottom-28 right-6 z-[9999] w-80 bg-black/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/70 p-5 animate-in slide-in-from-bottom-4 duration-300 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0">
                <Music className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold leading-tight">
                  ዓይኔ ላይ ነው
                </h4>
                <p className="text-gray-400 text-xs">NOVAREING 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleLyrics}
                className={`p-1.5 rounded-full transition-colors ${
                  showLyrics
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "hover:bg-white/10 text-gray-400 hover:text-white"
                }`}
                aria-label="Toggle lyrics"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={closeController}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Lyrics Display */}
          {showLyrics && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/5 max-h-48 overflow-y-auto">
              <div className="text-center mb-3">
                <p className="text-yellow-400 text-lg font-medium transition-all duration-300 leading-relaxed">
                  {currentLyric || "🎵 ዝም ብለህ ስማ..."}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {lyricsData.map((lyric, index) => {
                  const isCurrent =
                    currentTime >= lyric.time &&
                    currentTime < (lyricsData[index + 1]?.time || Infinity);
                  return (
                    <span
                      key={index}
                      className={`text-[10px] px-2 py-0.5 rounded transition-all duration-300 ${
                        isCurrent
                          ? "bg-yellow-500/30 text-yellow-400 font-medium scale-105"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {lyric.text.length > 15
                        ? lyric.text.substring(0, 15) + "..."
                        : lyric.text}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-3">
            <div
              className="relative w-full h-1.5 bg-white/10 rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                seekTo(x * duration);
              }}
              onMouseDown={() => (isDraggingRef.current = true)}
              onMouseUp={() => (isDraggingRef.current = false)}
              onMouseLeave={() => (isDraggingRef.current = false)}
            >
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-yellow-400/50"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-gray-400 text-xs">
                {formatTime(currentTime)}
              </span>
              <span className="text-gray-400 text-xs">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => seekTo(Math.max(0, currentTime - 10))}
              className="p-2 rounded-full hover:bg-white/10 transition-colors group"
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg shadow-yellow-500/30 hover:scale-105 group"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={() => seekTo(Math.min(duration, currentTime + 10))}
              className="p-2 rounded-full hover:bg-white/10 transition-colors group"
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/10 transition-colors group"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                )}
              </button>
              <div className="w-16">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (val === 0) {
                      setIsMuted(true);
                    } else if (isMuted) {
                      setIsMuted(false);
                    }
                  }}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-yellow-400/30"
                />
              </div>
            </div>
          </div>

          {/* Audio Visualizer Mini Indicator */}
          {isPlaying && (
            <div className="mt-3 flex items-center justify-center gap-0.5 h-4">
              {Array.from({ length: 12 }).map((_, i) => {
                const height = 2 + Math.random() * (audioLevel * 12);
                return (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-full transition-all duration-150"
                    style={{
                      height: `${height}px`,
                      opacity: 0.3 + audioLevel * 0.7,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Music Note Button - Visible and rotating while playing */}
      {isPlaying && (
        <button
          onClick={toggleController}
          className="fixed bottom-24 right-6 z-[9999] p-3 rounded-full bg-gradient-to-br from-yellow-500/90 to-yellow-600/90 backdrop-blur-md border border-yellow-400/40 hover:border-yellow-300/60 transition-all duration-300 hover:scale-110 shadow-lg shadow-yellow-500/30 group"
          aria-label="Open audio controller"
        >
          <Music
            className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300 animate-spin-slow"
            style={{ animationDuration: "4s" }}
          />
          {!isMuted && isPlaying && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
          )}
          {isMuted && isPlaying && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400 shadow-lg shadow-red-400/50" />
          )}
        </button>
      )}

      {/* Floating Mini Audio Button (Mute/Unmute) - Always visible */}
      <button
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-[9999] p-3 rounded-full bg-black/80 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110 shadow-lg shadow-black/50"
        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white" />
        ) : (
          <Volume2 className="w-6 h-6 text-white" />
        )}
        {/* Audio visualizer indicator */}
        {!isMuted && isPlaying && audioLevel > 0.1 && (
          <div className="absolute -top-1 -right-1 flex gap-0.5">
            <div
              className="w-1 h-2 bg-green-500 rounded-sm animate-pulse"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="w-1 h-3 bg-green-400 rounded-sm animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-1 h-2 bg-green-300 rounded-sm animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        )}
        {!isMuted && isPlaying && audioLevel <= 0.1 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        )}
      </button>

      {/* Add custom animation for slow spin */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </AudioContext.Provider>
  );
}
