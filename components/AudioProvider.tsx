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
  currentImage: string;
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

// All images from all day folders
const allImages = [
  // Gabi Day images
  "/images/gabi_day/gabi9.jpg",
  "/images/gabi_day/gabi10.jpg",
  "/images/gabi_day/gabi11.jpg",
  "/images/gabi_day/gabi12.jpg",
  "/images/gabi_day/gabi13.jpg",
  "/images/gabi_day/gabi14.jpg",
  "/images/gabi_day/gabi15.jpg",
  "/images/gabi_day/gabi16.jpg",
  "/images/gabi_day/gabi17.jpg",
  "/images/gabi_day/gabi18.jpg",
  "/images/gabi_day/gabi19.jpg",
  "/images/gabi_day/gabi21.jpg",
  "/images/gabi_day/gabi22.jpg",
  "/images/gabi_day/gabi23.jpg",
  "/images/gabi_day/gabi24.jpg",
  "/images/gabi_day/gabi25.jpg",
  "/images/gabi_day/gabi26.jpg",
  "/images/gabi_day/gabi27.jpg",
  "/images/gabi_day/gabi28.jpg",
  "/images/gabi_day/gabi29.jpg",
  "/images/gabi_day/gabi30.jpg",
  "/images/gabi_day/gabi31.jpg",
  "/images/gabi_day/gabi32.jpg",
  "/images/gabi_day/gabi33.jpg",
  "/images/gabi_day/gabi34.jpg",
  "/images/gabi_day/gabi35.jpg",
  "/images/gabi_day/gabi36.jpg",
  "/images/gabi_day/gabi37.jpg",
  "/images/gabi_day/gabi38.jpg",
  "/images/gabi_day/gabi39.jpg",
  "/images/gabi_day/gabi41.jpg",
  "/images/gabi_day/gabi42.jpg",
  "/images/gabi_day/gabi43.jpg",
  "/images/gabi_day/gabi44.jpg",
  "/images/gabi_day/gabi45.jpg",
  "/images/gabi_day/gabi46.jpg",
  "/images/gabi_day/gabi47.jpg",
  "/images/gabi_day/gabi48.jpg",
  "/images/gabi_day/gabi49.jpg",
  "/images/gabi_day/gabi50.jpg",
  "/images/gabi_day/gabi51.jpg",
  "/images/gabi_day/gabi52.jpg",
  "/images/gabi_day/gabi53.jpg",
  "/images/gabi_day/gabi54.jpg",
  "/images/gabi_day/gabi55.jpg",
  "/images/gabi_day/gabi56.jpg",
  "/images/gabi_day/gabi57.jpg",
  "/images/gabi_day/gabi58.jpg",
  "/images/gabi_day/gabi59.jpg",
  "/images/gabi_day/gabi60.jpg",
  "/images/gabi_day/gabi61.jpg",
  "/images/gabi_day/gabi62.jpg",
  "/images/gabi_day/gabi63.jpg",
  "/images/gabi_day/gabi64.jpg",
  "/images/gabi_day/gabi65.jpg",
  "/images/gabi_day/gabi66.jpg",
  "/images/gabi_day/gabi67.jpg",
  "/images/gabi_day/gabi68.jpg",
  "/images/gabi_day/gabi69.jpg",
  "/images/gabi_day/gabi70.jpg",
  "/images/gabi_day/gabi71.jpg",
  "/images/gabi_day/gabi72.jpg",
  "/images/gabi_day/gabi73.jpg",
  "/images/gabi_day/gabi74.jpg",
  "/images/gabi_day/gabi75.jpg",
  "/images/gabi_day/gabi76.jpg",
  "/images/gabi_day/gabi77.jpg",
  "/images/gabi_day/gabi78.jpg",
  "/images/gabi_day/gabi79.jpg",
  "/images/gabi_day/gabi80.jpg",
  "/images/gabi_day/gabi81.jpg",
  "/images/gabi_day/gabi82.jpg",
  "/images/gabi_day/gabi83.jpg",
  "/images/gabi_day/gabi84.jpg",
  "/images/gabi_day/gabi85.jpg",
  "/images/gabi_day/gabi86.jpg",
  "/images/gabi_day/gabi87.jpg",
  "/images/gabi_day/gabi88.jpg",
  "/images/gabi_day/gabi89.jpg",
  "/images/gabi_day/gabi90.jpg",
  "/images/gabi_day/gabi91.jpg",
  "/images/gabi_day/gabi92.jpg",
  "/images/gabi_day/gabi93.jpg",
  "/images/gabi_day/gabi94.jpg",
  "/images/gabi_day/gabi95.jpg",
  "/images/gabi_day/gabi96.jpg",
  "/images/gabi_day/gabi97.jpg",
  "/images/gabi_day/gabi99.jpg",
  "/images/gabi_day/gabi100.jpg",
  "/images/gabi_day/gabi101.jpg",
  "/images/gabi_day/gabi102.jpg",
  "/images/gabi_day/gabi103.jpg",
  "/images/gabi_day/gabi104.jpg",
  "/images/gabi_day/gabi105.jpg",
  "/images/gabi_day/gabi106.jpg",
  "/images/gabi_day/gabi107.jpg",
  "/images/gabi_day/gabi108.jpg",
  "/images/gabi_day/gabi109.jpg",
  "/images/gabi_day/gabi110.jpg",
  "/images/gabi_day/gabi111.jpg",
  "/images/gabi_day/gabi112.jpg",
  "/images/gabi_day/gabi113.jpg",
  "/images/gabi_day/gabi114.jpg",
  "/images/gabi_day/gabi115.jpg",
  "/images/gabi_day/gabi116.jpg",
  "/images/gabi_day/gabi117.jpg",
  "/images/gabi_day/gabi118.jpg",
  "/images/gabi_day/gabi119.jpg",
  "/images/gabi_day/gabi120.jpg",
  "/images/gabi_day/gabi121.jpg",
  "/images/gabi_day/gabi122.jpg",
  "/images/gabi_day/gabi123.jpg",
  "/images/gabi_day/gabi124.jpg",
  "/images/gabi_day/gabi125.jpg",
  "/images/gabi_day/gabi126.jpg",
  "/images/gabi_day/gabi127.jpg",
  "/images/gabi_day/gabi128.jpg",
  "/images/gabi_day/gabi129.jpg",
  "/images/gabi_day/gabi130.jpg",
  "/images/gabi_day/gabi131.jpg",
  "/images/gabi_day/gabi132.jpg",
  "/images/gabi_day/gabi133.jpg",
  "/images/gabi_day/gabi135.jpg",
  "/images/gabi_day/gabi136.jpg",
  "/images/gabi_day/gabi137.jpg",
  "/images/gabi_day/gabi139.jpg",
  "/images/gabi_day/gabi140.jpg",
  "/images/gabi_day/gabi142.jpg",
  "/images/gabi_day/gabi143.jpg",
  "/images/gabi_day/gabi144.jpg",
  "/images/gabi_day/gabi145.jpg",
  "/images/gabi_day/gabi146.jpg",
  "/images/gabi_day/gabi147.jpg",
  "/images/gabi_day/gabi148.jpg",
  "/images/gabi_day/gabi149.jpg",
  "/images/gabi_day/gabi150.jpg",
  "/images/gabi_day/gabi151.jpg",
  "/images/gabi_day/gabi152.jpg",
  "/images/gabi_day/gabi153.jpg",
  "/images/gabi_day/gabi154.jpg",
  "/images/gabi_day/gabi155.jpg",
  "/images/gabi_day/gabi156.jpg",
  "/images/gabi_day/gabi157.jpg",
  "/images/gabi_day/gabi159.jpg",
  "/images/gabi_day/gabi160.jpg",
  "/images/gabi_day/gabi161.jpg",
  "/images/gabi_day/gabi162.jpg",
  "/images/gabi_day/gabi163.jpg",
  "/images/gabi_day/gabi165.jpg",
  "/images/gabi_day/gabi166.jpg",
  "/images/gabi_day/gabi167.jpg",
  "/images/gabi_day/gabi168.jpg",
  "/images/gabi_day/gabi169.jpg",
  "/images/gabi_day/gabi170.jpg",

  // Photoshot Day images
  "/images/photoshot_day/photoshot_1.jpg",
  "/images/photoshot_day/photoshot_2.jpg",
  "/images/photoshot_day/photoshot_3.jpg",
  "/images/photoshot_day/photoshot_4.jpg",
  "/images/photoshot_day/photoshot_5.jpg",
  "/images/photoshot_day/photoshot_6.jpg",

  // Welcome Day images
  "/images/welcome_day/welcome1.jpg",
  "/images/welcome_day/welcome3.jpg",
  "/images/welcome_day/welcome5.jpg",
  "/images/welcome_day/welcome7.jpg",
  "/images/welcome_day/welcome9.jpg",
  "/images/welcome_day/welcome11.jpg",
  "/images/welcome_day/welcome12.jpg",
  "/images/welcome_day/welcome13.jpg",
  "/images/welcome_day/welcome14.jpg",
  "/images/welcome_day/welcome15.jpg",
  "/images/welcome_day/welcome16.jpg",
  "/images/welcome_day/welcome17.jpg",
  "/images/welcome_day/welcome18.jpg",
  "/images/welcome_day/welcome19.jpg",
  "/images/welcome_day/welcome20.jpg",
  "/images/welcome_day/welcome21.jpg",
  "/images/welcome_day/welcome22.jpg",
  "/images/welcome_day/welcome23.jpg",
  "/images/welcome_day/welcome24.jpg",
  "/images/welcome_day/welcome25.jpg",
  "/images/welcome_day/welcome26.jpg",
  "/images/welcome_day/welcome27.jpg",
  "/images/welcome_day/welcome28.jpg",
  "/images/welcome_day/welcome29.jpg",
  "/images/welcome_day/welcome30.jpg",
  "/images/welcome_day/welcome31.jpg",
  "/images/welcome_day/welcome32.jpg",
  "/images/welcome_day/welcome33.jpg",
  "/images/welcome_day/welcome34.jpg",
  "/images/welcome_day/welcome35.jpg",
  "/images/welcome_day/welcome36.jpg",
  "/images/welcome_day/welcome37.jpg",
  "/images/welcome_day/welcome38.jpg",
  "/images/welcome_day/welcome39.jpg",
  "/images/welcome_day/welcome40.jpg",
  "/images/welcome_day/welcome41.jpg",
  "/images/welcome_day/welcome42.jpg",
  "/images/welcome_day/welcome43.jpg",
  "/images/welcome_day/welcome44.jpg",
  "/images/welcome_day/welcome45.jpg",
  "/images/welcome_day/welcome46.jpg",
  "/images/welcome_day/welcome47.jpg",
  "/images/welcome_day/welcome48.jpg",
  "/images/welcome_day/welcome49.jpg",
  "/images/welcome_day/welcome50.jpg",
  "/images/welcome_day/welcome52.jpg",
  "/images/welcome_day/welcome54.jpg",
  "/images/welcome_day/welcome56.jpg",
  "/images/welcome_day/welcome58.jpg",
  "/images/welcome_day/welcome60.jpg",
  "/images/welcome_day/welcome62.jpg",
  "/images/welcome_day/welcome64.jpg",
  "/images/welcome_day/welcome65.jpg",
  "/images/welcome_day/welcome66.jpg",
  "/images/welcome_day/welcome67.jpg",
  "/images/welcome_day/welcome68.jpg",
  "/images/welcome_day/welcome69.jpg",
  "/images/welcome_day/welcome70.jpg",
  "/images/welcome_day/welcome71.jpg",
  "/images/welcome_day/welcome72.jpg",
  "/images/welcome_day/welcome73.jpg",
  "/images/welcome_day/welcome74.jpg",

  // Entrance Vibe Day images
  "/images/entrance_vibe_day/entrance_vibe_1.jpg",
  "/images/entrance_vibe_day/entrance_vibe_2.jpg",
  "/images/entrance_vibe_day/entrance_vibe_3.jpg",
  "/images/entrance_vibe_day/entrance_vibe_4.jpg",
  "/images/entrance_vibe_day/entrance_vibe_5.jpg",
  "/images/entrance_vibe_day/entrance_vibe_6.jpg",
  "/images/entrance_vibe_day/entrance_vibe_7.jpg",
  "/images/entrance_vibe_day/entrance_vibe_8.jpg",
  "/images/entrance_vibe_day/entrance_vibe_9.jpg",
  "/images/entrance_vibe_day/entrance_vibe_10.jpg",

  // Jersey Day images
  "/images/jersey_day/jersey1.jpg",
  "/images/jersey_day/jersey2.jpg",
  "/images/jersey_day/jersey3.jpg",
  "/images/jersey_day/jersey4.jpg",
  "/images/jersey_day/jersey5.jpg",
  "/images/jersey_day/jersey6.jpg",
  "/images/jersey_day/jersey7.jpg",
  "/images/jersey_day/jersey8.jpg",
  "/images/jersey_day/jersey9.jpg",
  "/images/jersey_day/jersey10.jpg",
  "/images/jersey_day/jersey11.jpg",
  "/images/jersey_day/jersey12.jpg",
  "/images/jersey_day/jersey13.jpg",
  "/images/jersey_day/jersey14.jpg",
  "/images/jersey_day/jersey15.jpg",
  "/images/jersey_day/jersey16.jpg",
  "/images/jersey_day/jersey17.jpg",
  "/images/jersey_day/jersey18.jpg",
  "/images/jersey_day/jersey19.jpg",
];

// Shuffle the images array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get shuffled images once
const shuffledImages = shuffleArray(allImages);

export function AudioProvider({ children }: AudioProviderProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showController, setShowController] = useState(false);
  const [currentImage, setCurrentImage] = useState(shuffledImages[0]);
  const [imageIndex, setImageIndex] = useState(0);
  const [transitionEffect, setTransitionEffect] = useState<
    "fade" | "slide" | "zoom" | "blur"
  >("fade");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get random transition effect
  const getRandomTransition = () => {
    const effects: ("fade" | "slide" | "zoom" | "blur")[] = [
      "fade",
      "slide",
      "zoom",
      "blur",
    ];
    return effects[Math.floor(Math.random() * effects.length)];
  };

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
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
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

  // Slideshow effect with fancy transitions
  useEffect(() => {
    if (isPlaying) {
      // Start slideshow interval - change image every 4 seconds
      slideshowIntervalRef.current = setInterval(() => {
        // Start transition
        setIsTransitioning(true);

        // Clear any pending transition timeout
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }

        // Change image after a short delay for the exit animation
        transitionTimeoutRef.current = setTimeout(() => {
          const newIndex = (imageIndex + 1) % shuffledImages.length;
          const newEffect = getRandomTransition();

          setImageIndex(newIndex);
          setCurrentImage(shuffledImages[newIndex]);
          setTransitionEffect(newEffect);

          // Reset transition state after the image loads
          setTimeout(() => {
            setIsTransitioning(false);
          }, 100);
        }, 400);

        // Change image every 4 seconds
      }, 4000);
    } else {
      // Clear interval when audio is paused
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      setIsTransitioning(false);
    }

    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [isPlaying, imageIndex]);

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

  // Get transition class based on current effect
  const getTransitionClass = () => {
    if (!isTransitioning) {
      return "opacity-100 scale-100 translate-x-0 translate-y-0 blur-0";
    }

    switch (transitionEffect) {
      case "fade":
        return "opacity-0";
      case "slide":
        return "translate-x-8 opacity-0";
      case "zoom":
        return "scale-110 opacity-0";
      case "blur":
        return "blur-md opacity-0";
      default:
        return "opacity-0";
    }
  };

  const getTransitionEnterClass = () => {
    switch (transitionEffect) {
      case "fade":
        return "opacity-0";
      case "slide":
        return "-translate-x-8 opacity-0";
      case "zoom":
        return "scale-90 opacity-0";
      case "blur":
        return "blur-md opacity-0";
      default:
        return "opacity-0";
    }
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
        currentImage,
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
            <button
              onClick={closeController}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Fancy Slideshow Display */}
          <div className="mb-4 p-2 bg-white/5 rounded-lg border border-white/5 overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black">
              <img
                src={currentImage}
                alt="Memory slideshow"
                className={`w-full h-full object-cover grayscale transition-all duration-700 ease-in-out ${getTransitionClass()}`}
                style={{ willChange: "transform, opacity, filter" }}
              />

              {/* Decorative border glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
              </div>
            </div>

            {/* Progress dots with animation */}
            <div className="flex justify-center mt-2 gap-1.5">
              {Array.from({ length: Math.min(6, shuffledImages.length) }).map(
                (_, i) => {
                  const dotIndex = Math.floor((i / 6) * shuffledImages.length);
                  const isActive =
                    dotIndex === imageIndex % shuffledImages.length;
                  return (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isActive
                          ? "w-6 bg-yellow-400 shadow-lg shadow-yellow-400/50"
                          : "w-1.5 bg-white/30"
                      }`}
                    />
                  );
                },
              )}
            </div>

            {/* Transition effect label */}
            <div className="flex justify-center mt-1.5">
              <span className="text-[8px] uppercase tracking-widest text-gray-500/70">
                {isTransitioning ? `✦ ${transitionEffect} ✦` : "✦ memories ✦"}
              </span>
            </div>
          </div>

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
