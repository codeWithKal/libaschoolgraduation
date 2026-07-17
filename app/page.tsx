"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  GraduationCap,
  Star,
  Sparkles,
  Award,
  Heart,
  Trophy,
  PartyPopper,
} from "lucide-react";
import { useAudio } from "@/components/AudioProvider";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import HeroSection from "@/components/hero-section";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

interface Student {
  id: number;
  name: string;
  cover_image: string;
  photo_url?: string;
}

interface Memory {
  id: number;
  type: string;
  url: string;
  caption: string;
}

// Icons for celebration
const celebrationIcons = [
  GraduationCap,
  Star,
  Sparkles,
  Award,
  Heart,
  Trophy,
  PartyPopper,
];

export default function Home() {
  const { audioLevel } = useAudio(); // Get audio level from provider
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentSlide, setStudentSlide] = useState(0);
  const [memorySlide, setMemorySlide] = useState(0);

  // Dynamic images state
  const [studentImages, setStudentImages] = useState<
    { id: number; src: string; alt: string }[]
  >([]);
  const [memoryImages, setMemoryImages] = useState<
    { id: number; src: string; alt: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // ----- GRADUATION BALLOON & ICON POP EFFECT -----
  const [celebrationElements, setCelebrationElements] = useState<
    {
      id: number;
      x: number;
      y: number;
      size: number;
      color: string;
      delay: number;
      type: "balloon" | "icon";
      iconIndex?: number;
    }[]
  >([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Check if celebration has already been shown in this session
  useEffect(() => {
    const celebrationShown = sessionStorage.getItem(
      "graduationCelebrationShown",
    );
    if (celebrationShown === "true") {
      setHasCelebrated(true);
    }
  }, []);

  // Trigger celebration when loading completes (only if not celebrated yet)
  useEffect(() => {
    if (!loading && !hasCelebrated && !showCelebration) {
      sessionStorage.setItem("graduationCelebrationShown", "true");
      setHasCelebrated(true);

      setShowCelebration(true);

      const totalElements = Math.floor(Math.random() * 15) + 25;
      const newElements = Array.from({ length: totalElements }, (_, i) => {
        const isBalloon = Math.random() > 0.4;
        return {
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: isBalloon ? Math.random() * 60 + 40 : Math.random() * 30 + 25,
          color: `hsl(${Math.random() * 60 + 320}, 85%, 60%)`,
          delay: Math.random() * 0.8,
          type: isBalloon ? "balloon" : "icon",
          iconIndex: !isBalloon
            ? Math.floor(Math.random() * celebrationIcons.length)
            : undefined,
        };
      });

      setCelebrationElements(newElements);

      const timer = setTimeout(() => {
        setShowCelebration(false);
        setCelebrationElements([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, hasCelebrated, showCelebration]);

  // Fetch random student photos
  useEffect(() => {
    async function fetchStudentPhotos() {
      try {
        const response = await fetch("/api/data/students.json");
        const students: Student[] = await response.json();

        const studentsWithPhotos = students.filter(
          (s) =>
            s.cover_image &&
            !s.cover_image.startsWith("data:") &&
            !s.cover_image.startsWith("https://"),
        );

        const shuffled = [...studentsWithPhotos].sort(
          () => Math.random() - 0.5,
        );
        const selected = shuffled.slice(0, 6);

        const formatted = selected.map((student, index) => ({
          id: student.id,
          src: student.cover_image?.startsWith("images/")
            ? `/${student.cover_image}`
            : student.cover_image || "",
          alt: student.name,
        }));

        setStudentImages(
          formatted.length > 0 ? formatted : getFallbackStudentImages(),
        );
      } catch (error) {
        console.error("Error fetching student photos:", error);
        setStudentImages(getFallbackStudentImages());
      }
    }

    fetchStudentPhotos();
  }, []);

  // Fetch random memories from Gabi Day and Welcome Day
  useEffect(() => {
    async function fetchMemoryPhotos() {
      try {
        const [gabiResponse, welcomeResponse] = await Promise.all([
          fetch("/api/data/gabi_day.json"),
          fetch("/api/data/welcome_day.json"),
        ]);

        const gabiMemories: Memory[] = await gabiResponse.json();
        const welcomeMemories: Memory[] = await welcomeResponse.json();

        const allMemories = [...gabiMemories, ...welcomeMemories].filter(
          (m) => m.type === "image" && m.url,
        );

        const shuffled = [...allMemories].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 8);

        const formatted = selected.map((memory, index) => ({
          id: memory.id,
          src: memory.url.startsWith("data:") ? memory.url : memory.url,
          alt: memory.caption || `Memory ${index + 1}`,
        }));

        setMemoryImages(
          formatted.length > 0 ? formatted : getFallbackMemoryImages(),
        );
      } catch (error) {
        console.error("Error fetching memory photos:", error);
        setMemoryImages(getFallbackMemoryImages());
      } finally {
        setLoading(false);
      }
    }

    fetchMemoryPhotos();
  }, []);

  // Fallback student images
  function getFallbackStudentImages() {
    return [
      {
        id: 1,
        src: "/images/students/full_image/addis_ersido.jpg",
        alt: "Addis Ersido",
      },
      {
        id: 2,
        src: "/images/students/full_image/amerti_daniel.jpg",
        alt: "Amerti Daniel",
      },
      {
        id: 3,
        src: "/images/students/full_image/asset_ersido.jpg",
        alt: "Asset ersido",
      },
      {
        id: 4,
        src: "/images/students/full_image/ayssa_albeza.jpg",
        alt: "Ayssa Albeza",
      },
      {
        id: 5,
        src: "/images/students/full_image/behiwot_lelisa.jpg",
        alt: "Behiwot Lelisa",
      },
      {
        id: 6,
        src: "/images/students/full_image/bezawit_ngea.jpg",
        alt: "Bezawit Ngea",
      },
      {
        id: 7,
        src: "/images/students/full_image/biruk_demeke.jpg",
        alt: "Biruk Demeke",
      },
      {
        id: 8,
        src: "/images/students/full_image/blen_hamba.jpg",
        alt: "Blen Hamba",
      },
      {
        id: 9,
        src: "/images/students/full_image/daniel_demeke.jpg",
        alt: "Daniel Demeke",
      },
      {
        id: 10,
        src: "/images/students/full_image/dibora_biniyam.jpg",
        alt: "Dibora Biniyam",
      },
      {
        id: 11,
        src: "/images/students/full_image/edlawit_akalu.jpg",
        alt: "Edlawit Akalu",
      },
      {
        id: 12,
        src: "/images/students/full_image/eliud_tewdros.jpg",
        alt: "Eliud Tewdros",
      },
      {
        id: 13,
        src: "/images/students/full_image/emahus_dereje.jpg",
        alt: "Emahus Dereje",
      },
      {
        id: 14,
        src: "/images/students/full_image/estifanos_abebaw.jpg",
        alt: "Estifanos Abebaw",
      },
      {
        id: 15,
        src: "/images/students/full_image/fikir_abayneh.jpg",
        alt: "Fikir Abayneh",
      },
      {
        id: 16,
        src: "/images/students/full_image/fikir_andargachew.jpg",
        alt: "Fikir Andargachew",
      },
      {
        id: 17,
        src: "/images/students/full_image/hawi_geremew.jpg",
        alt: "Hawi Geremew",
      },
      {
        id: 18,
        src: "/images/students/full_image/leti_gemechis.jpg",
        alt: "Leti Gemechis",
      },
      {
        id: 19,
        src: "/images/students/full_image/mahlet_abebe.jpg",
        alt: "Mahlet Abebe",
      },
      {
        id: 20,
        src: "/images/students/full_image/maramawit_tesfaye.jpg",
        alt: "Maramawit Tesfaye",
      },
      {
        id: 21,
        src: "/images/students/full_image/marta_tesfaye.jpg",
        alt: "Marta Tesfaye",
      },
      {
        id: 22,
        src: "/images/students/full_image/messale_kassahun.jpg",
        alt: "Messale Kassahun",
      },
      {
        id: 23,
        src: "/images/students/full_image/moa_dereje.jpg",
        alt: "Moa Dereje",
      },
      {
        id: 24,
        src: "/images/students/full_image/moyka_tesfaye.jpg",
        alt: "Moyka Tesfaye",
      },
      {
        id: 25,
        src: "/images/students/full_image/nahom_yonas.jpg",
        alt: "Nahom Yonas",
      },
      {
        id: 26,
        src: "/images/students/full_image/nahusenay_tesfaye.jpg",
        alt: "Nahusenay Tesfaye",
      },
      {
        id: 27,
        src: "/images/students/full_image/naol_feleke.jpg",
        alt: "Naol Feleke",
      },
      {
        id: 28,
        src: "/images/students/full_image/nathnael_jemberu.jpg",
        alt: "Nathnael Jemberu",
      },
      {
        id: 29,
        src: "/images/students/full_image/nuhamin_abebe.jpg",
        alt: "Nuhamin Abebe",
      },
      {
        id: 30,
        src: "/images/students/full_image/sifen_bulcha.jpg",
        alt: "Sifen Bulcha",
      },
      {
        id: 31,
        src: "/images/students/full_image/sumeya_endres.jpg",
        alt: "Sumeya Endres",
      },
      {
        id: 32,
        src: "/images/students/full_image/tilahun_gezahegn.jpg",
        alt: "Tilahun Gezahegn",
      },
      {
        id: 33,
        src: "/images/students/full_image/yeabsira_lema.jpg",
        alt: "Yeabsira Lema",
      },
      {
        id: 34,
        src: "/images/students/full_image/yeabsira_solomon.jpg",
        alt: "Yeabsira Solomon",
      },
      {
        id: 35,
        src: "/images/students/full_image/yididiya_dawit.jpg",
        alt: "Yididiya Dawit",
      },
      {
        id: 36,
        src: "/images/students/full_image/yohana_eyob.jpg",
        alt: "Yohana Eyob",
      },
      {
        id: 37,
        src: "/images/students/full_image/yonas_berta.jpg",
        alt: "Yonas Berta",
      },
      {
        id: 38,
        src: "/images/students/full_image/rodas_daniel.jpg",
        alt: "Rodas Daniel",
      },
      { id: 39, src: "/images/students/full_image/sifen.jpg", alt: "Sifen" },
    ];
  }

  // Fallback memory images
  function getFallbackMemoryImages() {
    return [
      { id: 1, src: "/images/gabi_day/gabi1.jpg", alt: "Memory 1" },
      { id: 2, src: "/images/welcome_day/trip1.jpg", alt: "Memory 2" },
      { id: 3, src: "/images/gabi_day/gabi2.jpg", alt: "Memory 3" },
      { id: 4, src: "/images/welcome_day/trip2.jpg", alt: "Memory 4" },
    ];
  }

  // Rotating slides
  useEffect(() => {
    if (studentImages.length === 0) return;

    const t = setInterval(() => {
      setStudentSlide((p) => (p + 1) % studentImages.length);
    }, 4000);
    return () => clearInterval(t);
  }, [studentImages.length]);

  useEffect(() => {
    if (memoryImages.length === 0) return;

    const t = setInterval(() => {
      setMemorySlide((p) => (p + 1) % memoryImages.length);
    }, 4500);
    return () => clearInterval(t);
  }, [memoryImages.length]);

  return (
    <div className="min-h-screen bg-netflix-dark text-white relative overflow-x-hidden">
      {/* 🎵 AUDIO VISUALIZER - Client only to prevent hydration mismatch */}
      <AudioVisualizer />

      {/* 🎈 GRADUATION BALLOON & ICON CELEBRATION OVERLAY */}
      {showCelebration && (
        <div className="fixed inset-0 z-[999] pointer-events-none overflow-hidden">
          {celebrationElements.map((el) => {
            if (el.type === "balloon") {
              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: el.size,
                    height: el.size * 1.2,
                    animation: `balloonPop 1s cubic-bezier(0.2, 0.9, 0.4, 1) ${el.delay}s forwards`,
                    transformOrigin: "center bottom",
                  }}
                >
                  <div
                    className="w-full h-full rounded-full relative"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${el.color}, ${el.color}dd)`,
                      boxShadow: `inset -8px -8px 20px rgba(0,0,0,0.2), inset 8px 8px 20px rgba(255,255,255,0.3), 0 8px 30px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <div className="absolute top-[15%] left-[20%] w-[25%] h-[18%] rounded-full bg-white/40 blur-sm" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-700 rounded-sm" />
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[1px] h-10 bg-gray-400/60" />
                    <div className="absolute top-[10%] right-[15%] w-2 h-2 bg-white rounded-full blur-[1px]" />
                  </div>
                </div>
              );
            } else {
              const IconComponent = celebrationIcons[el.iconIndex || 0];
              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    animation: `iconPop 0.9s cubic-bezier(0.2, 0.9, 0.4, 1) ${el.delay}s forwards`,
                  }}
                >
                  <IconComponent
                    size={el.size}
                    style={{
                      color: el.color,
                      filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.3)) drop-shadow(0 0 20px ${el.color}40)`,
                    }}
                  />
                </div>
              );
            }
          })}

          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`confetti-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                background: `hsl(${Math.random() * 360}, 90%, 65%)`,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                animation: `confettiFall ${Math.random() * 1.5 + 1.2}s cubic-bezier(0.1, 0.8, 0.3, 1) ${Math.random() * 0.5}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}

          <style jsx>{`
            @keyframes balloonPop {
              0% {
                transform: scale(0.2) translateY(50px) rotate(-10deg);
                opacity: 0;
              }
              15% {
                transform: scale(1.1) translateY(-5px) rotate(5deg);
                opacity: 1;
              }
              35% {
                transform: scale(1) translateY(-25px) rotate(-3deg);
                opacity: 1;
              }
              65% {
                transform: scale(1.2) translateY(-70px) rotate(8deg);
                opacity: 1;
              }
              100% {
                transform: scale(2.5) translateY(-160px) rotate(20deg);
                opacity: 0;
              }
            }
            @keyframes iconPop {
              0% {
                transform: scale(0) rotate(-30deg) translateY(30px);
                opacity: 0;
              }
              20% {
                transform: scale(1.3) rotate(10deg) translateY(-10px);
                opacity: 1;
              }
              50% {
                transform: scale(1) rotate(-5deg) translateY(-40px);
                opacity: 1;
              }
              80% {
                transform: scale(1.2) rotate(15deg) translateY(-80px);
                opacity: 1;
              }
              100% {
                transform: scale(0.5) rotate(40deg) translateY(-140px);
                opacity: 0;
              }
            }
            @keyframes confettiFall {
              0% {
                transform: translateY(-40px) rotate(0deg) scale(0.5);
                opacity: 1;
              }
              100% {
                transform: translateY(120vh) rotate(720deg) scale(1.2);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

      {/* MOBILE MENU */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded bg-black/60 backdrop-blur border border-white/10"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <HeroSection />

      {/* 🃏 FEATURED SECTION */}
      <section className="relative px-4 md:px-8 py-24 max-w-7xl mx-auto z-10">
        {/* Background Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-netflix-red/10 blur-3xl rounded-full" />
        </div>

        {/* SECTION HEADER */}
        <div className="relative text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-300 text-sm font-medium mb-6">
            ✨ Explore The Experience
          </div>

          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-4xl md:text-6xl font-black text-white mb-6"
          >
            Celebrate The
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200">
              NOVAREING Journey
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-netflix-lightgray text-lg leading-relaxed">
            Discover graduating students, relive unforgettable moments, and
            leave your mark in the celebration guestbook.
          </p>
        </div>

        {/* FEATURE CARDS */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* 🎓 STUDENTS CARD */}
          <div className="group">
            <Link
              href="/students"
              className="
                relative block overflow-hidden rounded-[2rem]
                aspect-[16/10]
                border border-white/10
                bg-black/40 backdrop-blur-xl
                transition-all duration-700
                hover:-translate-y-2
                hover:border-yellow-400/40
                hover:shadow-[0_40px_100px_rgba(250,204,21,0.15)]
              "
            >
              <div className="absolute inset-0 flex">
                {studentImages.length > 0 ? (
                  <>
                    {[0, 1, 2].map((offset) => {
                      const index =
                        (studentSlide + offset) % studentImages.length;
                      const img = studentImages[index];
                      if (!img) return null;

                      return (
                        <div
                          key={`${img.id}-${offset}`}
                          className={`
                            relative w-1/3 overflow-hidden
                            transition-all duration-700
                            ${offset === 1 ? "scale-105 brightness-110 z-10" : "opacity-60 scale-95"}
                          `}
                        >
                          <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 33vw, 20vw"
                          />
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <p className="text-gray-500">Loading students...</p>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/95" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10" />

              <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/10 text-yellow-300 text-xs font-bold uppercase tracking-[0.2em] mb-5 w-fit">
                  🎓 Student Directory
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-white mb-3 group-hover:text-yellow-300 transition duration-500">
                  The People Who Made It Special
                </h3>

                <p className="text-netflix-lightgray text-base md:text-lg max-w-md leading-relaxed mb-6">
                  More than classmates, We're a family of dreamers, leaders, and
                  lifelong friends.
                </p>

                <div className="flex items-center gap-3 text-yellow-300 font-semibold text-lg">
                  Explore the Class
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* 📸 MEMORIES CARD */}
          <div className="group">
            <Link
              href="/memories"
              className="
                relative block overflow-hidden rounded-[2rem]
                aspect-[16/10]
                border border-white/10
                bg-black/40 backdrop-blur-xl
                transition-all duration-700
                hover:-translate-y-2
                hover:border-netflix-red/40
                hover:shadow-[0_40px_100px_rgba(229,9,20,0.18)]
              "
            >
              <div className="absolute inset-0 flex">
                {memoryImages.length > 0 ? (
                  <>
                    {[0, 1, 2].map((offset) => {
                      const index =
                        (memorySlide + offset) % memoryImages.length;
                      const img = memoryImages[index];
                      if (!img) return null;

                      return (
                        <div
                          key={`${img.id}-${offset}`}
                          className={`
                            relative w-1/3 overflow-hidden
                            transition-all duration-700
                            ${offset === 1 ? "scale-105 brightness-110 z-10" : "opacity-60 scale-95"}
                          `}
                        >
                          <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 33vw, 20vw"
                          />
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <p className="text-gray-500">Loading memories...</p>
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/95" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-r from-netflix-red/10 via-transparent to-yellow-400/10" />

              <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/10 text-netflix-red text-xs font-bold uppercase tracking-[0.2em] mb-5 w-fit">
                  📸 Memory Gallery
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-white mb-3 group-hover:text-netflix-red transition duration-500">
                  Our Story in Pictures
                </h3>

                <p className="text-netflix-lightgray text-base md:text-lg max-w-md leading-relaxed mb-6">
                  From ordinary school days to extraordinary milestones-relive
                  every unforgettable moment.
                </p>

                <div className="flex items-center gap-3 text-netflix-red font-semibold text-lg">
                  Browse Gallery
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 🃏 GUESTBOOK PREMIUM CARD */}
        <div className="mt-16">
          <Link
            href="/guestbook"
            className="group relative block overflow-hidden rounded-[2rem] md:rounded-[2.5rem]"
          >
            <div
              className="
                relative overflow-hidden
                min-h-[320px] md:min-h-[420px]
                border border-yellow-500/20
                bg-gradient-to-br from-black via-zinc-900 to-black
                transition-all duration-700
                hover:scale-[1.01]
                hover:border-yellow-400/40
                shadow-[0_30px_80px_rgba(0,0,0,0.7)]
              "
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10 opacity-70 group-hover:opacity-100 transition duration-700" />
              <div className="absolute -top-20 -left-20 w-56 h-56 md:w-72 md:h-72 bg-yellow-500/10 blur-3xl rounded-full" />
              <div className="absolute -bottom-20 -right-20 w-56 h-56 md:w-72 md:h-72 bg-netflix-red/10 blur-3xl rounded-full" />
              <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />

              <div className="relative z-10 flex items-center h-full px-5 sm:px-8 md:px-14 py-10 md:py-14">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mb-5">
                    ♠ Signature Guestbook
                  </div>

                  <h3 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight mb-5 group-hover:text-yellow-300 transition duration-500">
                    Leave Your Message
                  </h3>

                  <p className="text-sm sm:text-base md:text-xl text-netflix-lightgray leading-relaxed mb-8 max-w-2xl">
                    Share your congratulations, memories, and heartfelt wishes
                    with the graduating NOVAREING batch.
                  </p>

                  <div className="inline-flex items-center gap-3 text-yellow-300 font-bold text-sm sm:text-base md:text-lg">
                    Open Guestbook
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
