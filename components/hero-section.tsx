"use client";

import { useEffect, useState } from "react";
import { useData } from "@/hooks/useData";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Sparkles, ArrowRight } from "lucide-react";

interface EventData {
  schoolName: string;
  batchName: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  countdownDate: string;
}

export default function HeroSection() {
  // ✅ Single declaration with isLoading
  const { data: eventData, isLoading } = useData<EventData>("event.json");

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isAfterGraduation, setIsAfterGraduation] = useState(false);

  const [reunionTimeLeft, setReunionTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!eventData?.countdownDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(eventData.countdownDate).getTime();

      const difference = target - now;

      if (difference > 0) {
        setIsAfterGraduation(false);

        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setIsAfterGraduation(true);

        const fiveYearsLater = new Date(eventData.countdownDate);
        fiveYearsLater.setFullYear(fiveYearsLater.getFullYear() + 5);

        const reunionDifference = fiveYearsLater.getTime() - now;

        if (reunionDifference > 0) {
          setReunionTimeLeft({
            days: Math.floor(reunionDifference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((reunionDifference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((reunionDifference / 1000 / 60) % 60),
            seconds: Math.floor((reunionDifference / 1000) % 60),
          });
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [eventData]);

  // ✅ Loading state - shown while data is being fetched
  if (isLoading || !eventData) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-netflix-dark">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-netflix-dark" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-netflix-red/30 border-t-netflix-red rounded-full animate-spin mx-auto mb-4" />
          <p className="text-netflix-lightgray text-lg">
            Loading ceremony details...
          </p>
        </div>
      </section>
    );
  }

  const countdown = isAfterGraduation ? reunionTimeLeft : timeLeft;

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center">
      {/* Background Image */}
      <Image
        src="/images/school-hero.jpg"
        alt="School Campus"
        fill
        priority
        className="object-cover grayscale brightness-[0.35] scale-105"
      />

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-netflix-dark" />

      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-netflix-red/15 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-yellow-500/10 blur-3xl rounded-full" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* CONTENT */}
      <div className="relative z-10 w-full px-4 md:px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-4xl">
            {/* TOP BADGE */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur border border-white/10 text-yellow-400 text-sm font-medium mb-8 shadow-lg">
              <Sparkles size={16} />
              {eventData.schoolName} • {eventData.batchName}
            </div>

            {/* MAIN TITLE */}
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="text-5xl text-center sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] text-white mb-8"
            >
              One Last Chapter
              <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-netflix-yellow via-yellow-400 to-yellow-300">
                A Night to Remember
              </span>
            </h1>

            {/* DESCRIPTION */}
            <div className="border border-white p-6 md:p-8 rounded-lg max-w-3xl mb-12">
              <p className="text-lg md:text-xl text-netflix-lightgray leading-relaxed">
                Every ending marks the beginning of something greater. Explore
                our stories, relive unforgettable moments, and celebrate the
                friendships, achievements, and memories that will stay with us
                forever.
              </p>
            </div>

            {/* EVENT CARDS */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* DATE */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-netflix-red/40 transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-netflix-red/10 to-transparent transition duration-500" />
                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-netflix-red/15 flex items-center justify-center border border-netflix-red/20">
                    <CalendarDays className="text-netflix-red" size={26} />
                  </div>
                  <div>
                    <p className="text-netflix-red text-xs uppercase tracking-[0.2em] font-bold mb-2">
                      Date & Time
                    </p>
                    <h3 className="text-white text-xl font-bold mb-1">
                      {eventData.date}
                    </h3>
                    <p className="text-netflix-lightgray">{eventData.time}</p>
                  </div>
                </div>
              </div>

              {/* VENUE */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-yellow-500/40 transition-all duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-500/10 to-transparent transition duration-500" />
                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                    <MapPin className="text-yellow-400" size={26} />
                  </div>
                  <div>
                    <p className="text-yellow-400 text-xs uppercase tracking-[0.2em] font-bold mb-2">
                      Venue
                    </p>
                    <h3 className="text-white text-xl font-bold mb-1">
                      {eventData.venue}
                    </h3>
                    <p className="text-netflix-lightgray">
                      Addis Ababa, Ethiopia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COUNTDOWN */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10 mb-12 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-netflix-red/10 via-transparent to-yellow-500/10" />
              <div className="relative">
                {/* Header */}
                <div className="text-center">
                  <p className="text-netflix-red text-xs uppercase tracking-[0.25em] font-bold mb-2">
                    NOVAREING
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    COUNTDOWN TO GRADUATION
                  </h2>
                  <p className="text-netflix-lightgray text-sm mt-3">
                    The Journey Begins
                  </p>
                  <p className="text-netflix-lightgray text-sm mt-1">
                    Time is flying — our moment is getting closer.
                  </p>
                </div>

                {/* Graduation Cape Underline */}
                <div className="flex items-center justify-center text-yellow-400 gap-4 my-6">
                  <div className="h-[2px] flex-1 max-w-20 bg-yellow-400" />
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-netflix-lightgray/50"
                  >
                    <path
                      d="M12 3L1 9L12 15L23 9L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 11V16.5C5 17.8807 8.13401 19 12 19C15.866 19 19 17.8807 19 16.5V11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 11V15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="h-[2px] flex-1 max-w-20 bg-yellow-400" />
                </div>

                {/* TIMER */}
                <div className="grid text-yellow-400 grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto">
                  {[
                    { label: "DAYS", value: countdown.days },
                    { label: "HOURS", value: countdown.hours },
                    { label: "MINUTES", value: countdown.minutes },
                    { label: "SECONDS", value: countdown.seconds },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-white/10 bg-black/30 p-6 text-center"
                    >
                      <div className="text-5xl md:text-6xl font-black text-white">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-netflix-red text-xs tracking-[0.2em] font-bold mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom text */}
                <div className="text-center mt-8">
                  <p className="text-netflix-lightgray text-sm">
                    New chapter. Same bond. Greater future.
                  </p>
                  <p className="text-yellow-400 font-semibold text-sm mt-0.5">
                    We're almost there.
                  </p>
                </div>
                <div className="flex items-center justify-center text-yellow-400 gap-4 my-6">
                  <div className="h-[2px] flex-1 max-w-20 bg-yellow-400" />
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-netflix-lightgray/50"
                  >
                    <path
                      d="M12 3L1 9L12 15L23 9L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 11V16.5C5 17.8807 8.13401 19 12 19C15.866 19 19 17.8807 19 16.5V11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 11V15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="h-[2px] flex-1 max-w-20 bg-yellow-400" />
                </div>
              </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/students"
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-netflix-yellow to-yellow-400 hover:scale-105 active:scale-95 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 shadow-[0_10px_40px_rgba(229,9,20,0.35)]"
              >
                Explore NOVAREING
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/memories"
                className="inline-flex items-center justify-center gap-3 border border-white/10 bg-white/5 backdrop-blur text-white hover:bg-white/10 py-5 px-8 rounded-2xl transition-all duration-300"
              >
                View Memories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
