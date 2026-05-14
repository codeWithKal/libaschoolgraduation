"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import HeroSection from "@/components/hero-section";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

/* 🃏 LOCAL IMAGES */
const studentImages = [
  { id: 1, src: "/images/students/student1.jpg", alt: "Student 1" },
  { id: 2, src: "/images/students/student2.jpg", alt: "Student 2" },
  { id: 3, src: "/images/students/student3.jpg", alt: "Student 3" },
];

const memoryImages = [
  { id: 1, src: "/images/gabi_day/gabi1.jpg", alt: "Memory 1" },
  { id: 2, src: "/images/trip_day/trip1.jpg", alt: "Memory 2" },
  { id: 3, src: "/images/gabi_day/gabi2.jpg", alt: "Memory 3" },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentSlide, setStudentSlide] = useState(0);
  const [memorySlide, setMemorySlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStudentSlide((p) => (p + 1) % studentImages.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setMemorySlide((p) => (p + 1) % memoryImages.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const cardBase =
    "group relative block rounded-2xl overflow-hidden aspect-video " +
    "bg-black border border-white/10 transition duration-500 " +
    "shadow-[0_40px_100px_rgba(0,0,0,0.7)]";

  const hoverFx =
    "hover:scale-[1.04] hover:-translate-y-2 hover:shadow-[0_60px_140px_rgba(0,0,0,0.85)]";

  return (
    <div className="min-h-screen bg-netflix-dark text-white">
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
      <section className="relative px-4 md:px-8 py-24 max-w-7xl mx-auto">
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
              {/* Image Grid */}
              <div className="absolute inset-0 flex">
                {studentImages.map((img, i) => (
                  <div
                    key={img.id}
                    className={`
                relative w-1/3 overflow-hidden
                transition-all duration-700
                ${
                  i === studentSlide
                    ? "scale-105 brightness-110 z-10"
                    : "opacity-60 scale-95"
                }
              `}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="
                  object-cover
                  transition-transform duration-700
                  group-hover:scale-110
                "
                    />
                  </div>
                ))}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/95" />

              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10" />

              {/* Content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/10 text-yellow-300 text-xs font-bold uppercase tracking-[0.2em] mb-5 w-fit">
                  🎓 Student Directory
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-black text-white mb-3 group-hover:text-yellow-300 transition duration-500">
                  Browse Students
                </h3>

                {/* Description */}
                <p className="text-netflix-lightgray text-base md:text-lg max-w-md leading-relaxed mb-6">
                  Explore profiles, achievements, and memories of the graduating
                  class.
                </p>

                {/* CTA */}
                <div className="flex items-center gap-3 text-yellow-300 font-semibold text-lg">
                  Explore Profiles
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
              {/* Images */}
              <div className="absolute inset-0 flex">
                {memoryImages.map((img, i) => (
                  <div
                    key={img.id}
                    className={`
                relative w-1/3 overflow-hidden
                transition-all duration-700
                ${
                  i === memorySlide
                    ? "scale-105 brightness-110 z-10"
                    : "opacity-60 scale-95"
                }
              `}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="
                  object-cover
                  transition-transform duration-700
                  group-hover:scale-110
                "
                    />
                  </div>
                ))}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/95" />

              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-r from-netflix-red/10 via-transparent to-yellow-400/10" />

              {/* Content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/10 text-netflix-red text-xs font-bold uppercase tracking-[0.2em] mb-5 w-fit">
                  📸 Memory Gallery
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-black text-white mb-3 group-hover:text-netflix-red transition duration-500">
                  Shared Memories
                </h3>

                {/* Description */}
                <p className="text-netflix-lightgray text-base md:text-lg max-w-md leading-relaxed mb-6">
                  Relive graduation moments, celebrations, trips, and
                  unforgettable experiences.
                </p>

                {/* CTA */}
                <div className="flex items-center gap-3 text-netflix-red font-semibold text-lg">
                  View Gallery
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
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10 opacity-70 group-hover:opacity-100 transition duration-700" />

              {/* Decorative Blur */}
              <div className="absolute -top-20 -left-20 w-56 h-56 md:w-72 md:h-72 bg-yellow-500/10 blur-3xl rounded-full" />

              <div className="absolute -bottom-20 -right-20 w-56 h-56 md:w-72 md:h-72 bg-netflix-red/10 blur-3xl rounded-full" />

              {/* Texture */}
              <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />

              {/* Content */}
              <div
                className="
          relative z-10
          flex items-center h-full
          px-5 sm:px-8 md:px-14
          py-10 md:py-14
        "
              >
                <div className="max-w-3xl">
                  {/* Badge */}
                  <div
                    className="
              inline-flex items-center gap-2
              px-4 py-2
              rounded-full
              bg-yellow-500/10
              border border-yellow-500/20

              text-yellow-300
              text-[10px] sm:text-xs
              uppercase
              tracking-[0.2em]
              font-bold

              mb-5
            "
                  >
                    ♠ Signature Guestbook
                  </div>

                  {/* Title */}
                  <h3
                    className="
              text-3xl sm:text-4xl md:text-6xl
              font-black
              text-white
              leading-tight

              mb-5

              group-hover:text-yellow-300
              transition duration-500
            "
                  >
                    Leave Your Message
                  </h3>

                  {/* Description */}
                  <p
                    className="
              text-sm sm:text-base md:text-xl
              text-netflix-lightgray
              leading-relaxed

              mb-8
              max-w-2xl
            "
                  >
                    Share your congratulations, memories, and heartfelt wishes
                    with the graduating NOVAREING batch.
                  </p>

                  {/* CTA */}
                  <div
                    className="
              inline-flex items-center gap-3

              text-yellow-300
              font-bold
              text-sm sm:text-base md:text-lg
            "
                  >
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
