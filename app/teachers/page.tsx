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
  Filter,
  ArrowUp,
  ChevronDown,
} from "lucide-react";

// Types
interface Teacher {
  id: number;
  name: string;
  phone: string;
  subject: string;
  photo_url: string;
  quote: string;
}

// Constants
const ANIMATION_DELAY = 0.05;
const DEBOUNCE_DELAY = 300;
const OBSERVER_ROOT_MARGIN = "200px";

// Custom Hooks
function useDebounce<T>(value: T, delay: number = DEBOUNCE_DELAY): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function usePagination<T>(items: T[], itemsPerPage: number = 12) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const newCount = Math.min(prev + itemsPerPage, items.length);
      return newCount;
    });
  }, [items.length, itemsPerPage]);

  const reset = useCallback(() => {
    setVisibleCount(itemsPerPage);
  }, [itemsPerPage]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  return { visibleItems, hasMore, loadMore, reset, total: items.length };
}

function useInfiniteScroll(loadMore: () => void, hasMore: boolean) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1, rootMargin: "500px" },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
      observer.disconnect();
    };
  }, [loadMore, hasMore]);

  return loaderRef;
}

// Components
function LazyTeacherImage({
  src,
  alt,
  className = "",
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
      { rootMargin: OBSERVER_ROOT_MARGIN, threshold: 0.01 },
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-gradient-to-yellow from-neutral-800 to-neutral-900 ${className}`}
    >
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gradient-to-yellow from-neutral-700 via-neutral-800 to-neutral-700 animate-shimmer" />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } group-hover:scale-110`}
        />
      )}
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  isLoading,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-neutral-400" />
      </div>
      <input
        type="text"
        placeholder="Search teachers by name or subject..."
        value={value}
        onChange={onChange}
        className="w-full h-14 pl-12 pr-12 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-neutral-400 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300"
      />
      {isLoading && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
        isActive
          ? "bg-yellow-600 text-white shadow-lg shadow-yellow-600/30 scale-105"
          : "bg-black/40 border border-white/10 text-neutral-300 hover:border-yellow-500/30 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function ViewToggle({
  currentView,
  onViewChange,
}: {
  currentView: "grid" | "tiles" | "list";
  onViewChange: (view: "grid" | "tiles" | "list") => void;
}) {
  const views = [
    { key: "grid" as const, label: "Grid", icon: LayoutGrid },
    { key: "tiles" as const, label: "Tiles", icon: Rows3 },
    { key: "list" as const, label: "List", icon: Grid2X2 },
  ];

  return (
    <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-black/40 border border-white/10">
      {views.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onViewChange(key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            currentView === key
              ? "bg-yellow-600 text-white shadow-lg shadow-yellow-600/30"
              : "text-neutral-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}

function TeacherCard({ teacher, index }: { teacher: Teacher; index: number }) {
  return (
    <div
      className="animate-slide-up group"
      style={{ animationDelay: `${(index % 8) * ANIMATION_DELAY}s` }}
    >
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 hover:border-yellow-500/30 transition-all duration-300 h-full flex flex-col hover:shadow-2xl hover:shadow-yellow-500/10">
        <div className="relative h-64 overflow-hidden">
          <LazyTeacherImage
            src={teacher.photo_url}
            alt={teacher.name}
            className="w-full h-full"
          />
        </div>
        <div className="flex-1 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-yellow-400 transition-colors">
            {teacher.name}
          </h3>
          <p className="text-yellow-500 text-sm font-medium mb-4">
            {teacher.subject}
          </p>
          <p className="text-neutral-400 text-sm flex-1 mb-4 line-clamp-2">
            {teacher.phone}
          </p>
          <blockquote className="text-yellow-200/80 text-xs italic border-l-2 border-yellow-500/30 pl-3">
            &ldquo;{teacher.quote}&rdquo;
          </blockquote>
        </div>
      </div>
    </div>
  );
}

function TeacherTile({ teacher, index }: { teacher: Teacher; index: number }) {
  return (
    <div
      className="animate-slide-up group"
      style={{ animationDelay: `${(index % 8) * ANIMATION_DELAY}s` }}
    >
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 hover:border-yellow-500/30 transition-all duration-300">
        <div className="aspect-square overflow-hidden">
          <LazyTeacherImage
            src={teacher.photo_url}
            alt={teacher.name}
            className="w-full h-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div>
            <h4 className="text-white font-semibold text-sm">{teacher.name}</h4>
            <p className="text-yellow-400 text-xs">{teacher.subject}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherListItem({
  teacher,
  index,
}: {
  teacher: Teacher;
  index: number;
}) {
  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${(index % 8) * ANIMATION_DELAY}s` }}
    >
      <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/30 hover:bg-white/[0.07] transition-all duration-300 group">
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-yellow-500/30 transition-all duration-300">
          <LazyTeacherImage
            src={teacher.photo_url}
            alt={teacher.name}
            className="w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xl font-semibold text-white group-hover:text-yellow-400 transition-colors">
            {teacher.name}
          </h4>
          <p className="text-yellow-500 font-medium mb-2">{teacher.subject}</p>
          <p className="text-neutral-400 text-sm mb-2 truncate">
            {teacher.phone}
          </p>
          <blockquote className="text-yellow-200/80 text-xs italic border-l-2 border-yellow-500/30 pl-3">
            &ldquo;{teacher.quote}&rdquo;
          </blockquote>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
        <Search className="text-neutral-400" size={36} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">No Teachers Found</h3>
      <p className="text-neutral-400 text-lg">
        Try adjusting your search criteria or filters
      </p>
    </div>
  );
}

function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="w-10 h-10 border-3 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      <p className="text-neutral-400 text-sm">{message}</p>
    </div>
  );
}

function ScrollToTopButton({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 p-3 rounded-full bg-yellow-600 text-white shadow-lg hover:bg-yellow-700 transition-all duration-300 hover:scale-110 z-40"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}

// Main Component
export default function TeachersPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "tiles" | "list">("grid");

  const { data: teachers } = useData<Teacher[]>("teachers.json");
  const debouncedSearchQuery = useDebounce(searchQuery);

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
  const isSearching = searchQuery !== debouncedSearchQuery;

  const renderTeacher = useCallback(
    (teacher: Teacher, index: number) => {
      switch (viewMode) {
        case "tiles":
          return (
            <TeacherTile key={teacher.id} teacher={teacher} index={index} />
          );
        case "list":
          return (
            <TeacherListItem key={teacher.id} teacher={teacher} index={index} />
          );
        default:
          return (
            <TeacherCard key={teacher.id} teacher={teacher} index={index} />
          );
      }
    },
    [viewMode],
  );

  return (
    <div className="min-h-screen bg-neutral-950 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-yellow-600/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-yellow-500/5 blur-3xl rounded-full" />
      </div>

      {/* Mobile Navigation */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 text-white hover:bg-black/70 transition-all duration-300"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="relative pt-24 px-4 md:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <header className="relative mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm font-medium mb-6">
              <Sparkles size={16} />
              Meet Our Mentors
            </div>

            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="text-5xl md:text-7xl font-black text-white leading-tight mb-6"
            >
              NOVAREING
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600">
                Faculty
              </span>
            </h1>

            <p className="max-w-3xl text-lg md:text-xl text-neutral-400 leading-relaxed">
              Get to know the dedicated educators who have shaped the NOVAREING
              batch and contributed to their success.
            </p>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="w-11 h-11 rounded-xl bg-red-600/15 flex items-center justify-center">
                  <Users className="text-yellow-500" size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{total}</p>
                  <p className="text-neutral-400 text-sm">Teachers</p>
                </div>
              </div>

              {visibleItems.length < total && (
                <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <p className="text-neutral-400 text-sm">
                    Showing{" "}
                    <span className="text-yellow-400 font-bold">
                      {visibleItems.length}
                    </span>{" "}
                    of {total}
                  </p>
                </div>
              )}
            </div>
          </header>

          {/* Filter Panel */}
          <div className="sticky top-20 z-30 mb-10">
            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-yellow-500/5 rounded-[2rem]" />

              <div className="relative space-y-6">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  isLoading={isSearching}
                />

                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                  {/* Subject Filters */}
                  <div className="flex flex-wrap gap-2">
                    <FilterButton
                      label="All Subjects"
                      isActive={!selectedSubject}
                      onClick={() => setSelectedSubject("")}
                    />
                    {subjects.map((subject) => (
                      <FilterButton
                        key={subject}
                        label={subject}
                        isActive={selectedSubject === subject}
                        onClick={() => setSelectedSubject(subject)}
                      />
                    ))}
                  </div>

                  {/* View Toggle */}
                  <ViewToggle
                    currentView={viewMode}
                    onViewChange={setViewMode}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Teachers Grid */}
          {visibleItems.length > 0 ? (
            <>
              <div
                className={
                  viewMode === "list"
                    ? "space-y-4"
                    : viewMode === "tiles"
                      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                }
              >
                {visibleItems.map((teacher, index) =>
                  renderTeacher(teacher, index),
                )}
              </div>

              {/* Infinite Scroll Loader */}
              <div ref={loaderRef}>
                {hasMore && (
                  <LoadingSpinner message="Loading more teachers..." />
                )}
              </div>

              {/* Manual Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    className="px-8 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-600/20"
                  >
                    Load More Teachers
                    <span className="ml-2 text-red-200">
                      ({visibleItems.length} / {total})
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      <ScrollToTopButton visible={visibleItems.length > 30} />
      <Footer />
    </div>
  );
}
