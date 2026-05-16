"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useData } from "@/hooks/useData";
import {
  Search,
  Menu,
  X,
  LayoutGrid,
  Rows3,
  Grid2X2,
  Sparkles,
  Users,
} from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  subject: string;
  photo_url: string;
  bio: string;
  quote: string;
}

// ✅ Lazy Image Component with Intersection Observer
function LazyTeacherImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px", threshold: 0.01 },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 ${className || ""}`}
    >
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 animate-pulse" />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } group-hover:scale-110 transition-transform duration-500`}
        />
      )}
    </div>
  );
}

// ✅ Pagination Hook
function usePagination<T>(items: T[], itemsPerPage: number = 12) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const [hasMore, setHasMore] = useState(items.length > itemsPerPage);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const newCount = Math.min(prev + itemsPerPage, items.length);
      setHasMore(newCount < items.length);
      return newCount;
    });
  }, [items.length, itemsPerPage]);

  const reset = useCallback(() => {
    setVisibleCount(itemsPerPage);
    setHasMore(items.length > itemsPerPage);
  }, [items.length, itemsPerPage]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  return { visibleItems, hasMore, loadMore, reset, total: items.length };
}

// ✅ Infinite Scroll Hook
function useInfiniteScroll(loadMore: () => void, hasMore: boolean) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "500px" },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
      observer.disconnect();
    };
  }, [loadMore, hasMore]);

  return loaderRef;
}

// ✅ Debounce Hook for Search
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function TeachersPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "tiles" | "list">("grid");

  const { data: teachers } = useData<Teacher[]>("teachers.json");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const subjects = useMemo(() => {
    if (!teachers) return [];
    return [...new Set(teachers.map((t) => t.subject))].sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];

    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        teacher.subject
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());

      const matchesSubject =
        !selectedSubject || teacher.subject === selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }, [teachers, debouncedSearchQuery, selectedSubject]);

  const itemsPerPage =
    viewMode === "list" ? 10 : viewMode === "tiles" ? 24 : 12;
  const { visibleItems, hasMore, loadMore, total } = usePagination(
    filteredTeachers,
    itemsPerPage,
  );

  const loaderRef = useInfiniteScroll(loadMore, hasMore);

  const viewOptions = [
    { key: "grid" as const, label: "Grid", icon: LayoutGrid },
    { key: "tiles" as const, label: "Tiles", icon: Rows3 },
    { key: "list" as const, label: "List", icon: Grid2X2 },
  ];

  const renderGridView = useCallback(
    (teacher: Teacher, index: number) => (
      <div
        key={teacher.id}
        className="animate-slide-in-up group"
        style={{ animationDelay: `${(index % 8) * 0.05}s` }}
      >
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 h-full flex flex-col hover:shadow-xl hover:shadow-yellow-500/20">
          {/* Teacher Photo */}
          <div className="relative h-64 overflow-hidden">
            <LazyTeacherImage
              src={teacher.photo_url}
              alt={teacher.name}
              className="w-full h-full"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
              {teacher.name}
            </h3>
            <p className="text-yellow-400 text-sm font-semibold mb-4">
              {teacher.subject}
            </p>
            <p className="text-gray-300 text-sm flex-1 mb-4 line-clamp-2">
              {teacher.bio}
            </p>
            <div className="pt-4 border-t border-white/10">
              <p className="text-yellow-200 text-xs italic">
                &quot;{teacher.quote}&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    [],
  );

  const renderTilesView = useCallback(
    (teacher: Teacher, index: number) => (
      <div
        key={teacher.id}
        className="animate-slide-in-up group"
        style={{ animationDelay: `${(index % 8) * 0.05}s` }}
      >
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 hover:border-yellow-500/30 transition-all duration-300">
          <div className="aspect-square overflow-hidden">
            <LazyTeacherImage
              src={teacher.photo_url}
              alt={teacher.name}
              className="w-full h-full"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <div>
              <h4 className="text-white font-bold text-sm">{teacher.name}</h4>
              <p className="text-yellow-400 text-xs">{teacher.subject}</p>
            </div>
          </div>
        </div>
      </div>
    ),
    [],
  );

  const renderListView = useCallback(
    (teacher: Teacher, index: number) => (
      <div
        key={teacher.id}
        className="animate-slide-in-up"
        style={{ animationDelay: `${(index % 8) * 0.05}s` }}
      >
        <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/30 hover:bg-white/10 transition-all duration-300 group">
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
            <LazyTeacherImage
              src={teacher.photo_url}
              alt={teacher.name}
              className="w-full h-full"
            />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
              {teacher.name}
            </h4>
            <p className="text-yellow-400 font-semibold mb-2">
              {teacher.subject}
            </p>
            <p className="text-gray-300 text-sm mb-2">{teacher.bio}</p>
            <p className="text-yellow-200 text-xs italic">
              &quot;{teacher.quote}&quot;
            </p>
          </div>
        </div>
      </div>
    ),
    [],
  );

  return (
    <div className="min-h-screen bg-netflix-dark overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden will-change-transform">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-netflix-red/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-yellow-500/10 blur-3xl rounded-full" />
      </div>

      {/* Mobile Menu Button */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="
            p-3 rounded-2xl
            bg-black/50 backdrop-blur-xl
            border border-white/10
            text-white
            hover:bg-black/70
            transition-all duration-300
          "
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Navigation */}
      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="relative pt-24 px-4 md:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="relative mb-14">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm font-medium mb-6">
              <Sparkles size={16} />
              Meet Our Mentors
            </div>

            {/* Title */}
            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="
                text-5xl md:text-7xl
                font-black
                text-white
                leading-tight
                mb-6
              "
            >
              NOVAREING
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600">
                Faculty
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-3xl text-lg md:text-xl text-netflix-lightgray leading-relaxed">
              Get to know the dedicated educators who have shaped the NOVAREING
              batch and contributed to their success.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="w-11 h-11 rounded-xl bg-netflix-red/15 flex items-center justify-center">
                  <Users className="text-netflix-red" size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{total}</p>
                  <p className="text-netflix-lightgray text-sm">Teachers</p>
                </div>
              </div>

              {visibleItems.length < total && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <p className="text-netflix-lightgray text-sm">
                    Showing{" "}
                    <span className="text-yellow-400 font-bold">
                      {visibleItems.length}
                    </span>{" "}
                    of {total}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FILTER PANEL */}
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              border border-white/10
              bg-white/5 backdrop-blur-2xl
              p-6 md:p-8
              mb-10
              sticky top-20 z-30
            "
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-netflix-red/5 via-transparent to-yellow-500/5" />

            <div className="relative">
              {/* Search with loading indicator */}
              <div className="relative mb-6">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-netflix-gray w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search teachers by name or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    w-full h-14
                    rounded-2xl
                    bg-black/40
                    border border-white/10
                    pl-14 pr-5
                    text-white
                    placeholder-netflix-lightgray
                    focus:outline-none
                    focus:border-netflix-red/50
                    focus:ring-2
                    focus:ring-netflix-red/20
                    transition-all duration-300
                  "
                />
                {searchQuery !== debouncedSearchQuery && (
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* FILTERS */}
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                {/* Subjects */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedSubject("")}
                    className={`
                      px-5 py-2.5 rounded-full
                      text-sm font-medium
                      transition-all duration-300
                      ${
                        !selectedSubject
                          ? "bg-netflix-red text-white shadow-lg shadow-netflix-red/30 scale-105"
                          : "bg-black/40 border border-white/10 text-netflix-lightgray hover:border-netflix-red/30 hover:text-white"
                      }
                    `}
                  >
                    All Subjects
                  </button>

                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`
                        px-5 py-2.5 rounded-full
                        text-sm font-medium
                        transition-all duration-300
                        ${
                          selectedSubject === subject
                            ? "bg-netflix-red text-white shadow-lg shadow-netflix-red/30 scale-105"
                            : "bg-black/40 border border-white/10 text-netflix-lightgray hover:border-netflix-red/30 hover:text-white"
                        }
                      `}
                    >
                      {subject}
                    </button>
                  ))}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/40 border border-white/10 w-fit">
                  {viewOptions.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.key}
                        onClick={() => setViewMode(mode.key)}
                        className={`
                          flex items-center gap-2
                          px-4 py-2 rounded-xl
                          text-sm font-medium
                          transition-all duration-300
                          ${
                            viewMode === mode.key
                              ? "bg-netflix-red text-white shadow-lg shadow-netflix-red/30"
                              : "text-netflix-lightgray hover:bg-white/5 hover:text-white"
                          }
                        `}
                      >
                        <Icon size={16} />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* TEACHERS SECTION with Pagination */}
          {visibleItems.length > 0 ? (
            <>
              <div
                className={
                  viewMode === "list"
                    ? "space-y-5"
                    : viewMode === "tiles"
                      ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                }
              >
                {viewMode === "list" &&
                  visibleItems.map((teacher, index) =>
                    renderListView(teacher, index),
                  )}
                {viewMode === "tiles" &&
                  visibleItems.map((teacher, index) =>
                    renderTilesView(teacher, index),
                  )}
                {viewMode === "grid" &&
                  visibleItems.map((teacher, index) =>
                    renderGridView(teacher, index),
                  )}
              </div>

              {/* Infinite Scroll Loader */}
              {hasMore && (
                <div
                  ref={loaderRef}
                  className="flex justify-center items-center py-12"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-netflix-red/30 border-t-netflix-red rounded-full animate-spin" />
                    <p className="text-netflix-lightgray text-sm">
                      Loading more teachers...
                    </p>
                  </div>
                </div>
              )}

              {/* Load More Button (Fallback) */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 rounded-full bg-netflix-red text-white font-medium hover:bg-netflix-red/80 transition-all duration-300 transform hover:scale-105"
                  >
                    Load More ({visibleItems.length} / {total})
                  </button>
                </div>
              )}

              {/* Scroll to top button */}
              {visibleItems.length > 30 && (
                <div className="fixed bottom-8 right-8 z-40">
                  <button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="p-3 rounded-full bg-netflix-red text-white shadow-lg hover:bg-netflix-red/80 transition-all duration-300 hover:scale-110"
                    aria-label="Scroll to top"
                  >
                    ↑
                  </button>
                </div>
              )}
            </>
          ) : (
            /* EMPTY STATE */
            <div className="text-center py-24">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Search className="text-netflix-lightgray" size={36} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                No Teachers Found
              </h3>

              <p className="text-netflix-lightgray text-lg">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
