"use client";

import { useState, useMemo } from "react";
import Navigation from "@/components/navigation";
import StudentCard from "@/components/student-card";
import StudentModal from "@/components/student-modal";
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

interface Student {
  id: number;
  name: string;
  department: string;
  photo: string;
  bio: string;
  lastWord: string;
  messages: string[];
}

export default function StudentsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [viewMode, setViewMode] = useState<"grid" | "tiles" | "list">("grid");

  const { data: students } = useData<Student[]>("students.json");

  const departments = useMemo(() => {
    if (!students) return [];

    return [...new Set(students.map((s) => s.department))];
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students.filter((student) => {
      const matchesSearch = student.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesDepartment =
        !selectedDepartment || student.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [students, searchQuery, selectedDepartment]);

  const viewOptions = [
    {
      key: "grid",
      label: "Grid",
      icon: LayoutGrid,
    },
    {
      key: "tiles",
      label: "Tiles",
      icon: Grid2X2,
    },
    {
      key: "list",
      label: "List",
      icon: Rows3,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-netflix-dark overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
              Graduation Directory
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
              }}
              className="
                text-5xl md:text-7xl
                font-black
                text-white
                leading-tight
                mb-6
              "
            >
              NOVAREING
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-netflix-yellow via-yellow-400 to-yellow-600">
                Batch 2026
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-3xl text-lg md:text-xl text-netflix-lightgray leading-relaxed">
              Browse the graduating class, discover student profiles, and
              celebrate the achievements of the NOVAREING batch.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="w-11 h-11 rounded-xl bg-netflix-red/15 flex items-center justify-center">
                  <Users className="text-netflix-red" size={20} />
                </div>

                <div>
                  <p className="text-white font-bold text-lg">
                    {filteredStudents.length}
                  </p>

                  <p className="text-netflix-lightgray text-sm">Students</p>
                </div>
              </div>
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
            "
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-netflix-red/5 via-transparent to-yellow-500/5" />

            <div className="relative">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-netflix-gray w-5 h-5" />

                <input
                  type="text"
                  placeholder="Search students..."
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
              </div>

              {/* FILTERS */}
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                {/* Departments */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedDepartment("")}
                    className={`
                      px-5 py-2.5 rounded-full
                      text-sm font-medium
                      transition-all duration-300
                      ${
                        !selectedDepartment
                          ? "bg-netflix-red text-white shadow-lg shadow-netflix-red/30"
                          : "bg-black/40 border border-white/10 text-netflix-lightgray hover:border-netflix-red/30 hover:text-white"
                      }
                    `}
                  >
                    All Streams
                  </button>

                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDepartment(dept)}
                      className={`
                        px-5 py-2.5 rounded-full
                        text-sm font-medium
                        transition-all duration-300
                        ${
                          selectedDepartment === dept
                            ? "bg-netflix-red text-white shadow-lg shadow-netflix-red/30"
                            : "bg-black/40 border border-white/10 text-netflix-lightgray hover:border-netflix-red/30 hover:text-white"
                        }
                      `}
                    >
                      {dept}
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

          {/* STUDENTS SECTION */}
          <div
            className={
              viewMode === "list"
                ? "space-y-5"
                : viewMode === "tiles"
                  ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            }
          >
            {filteredStudents.map((student, index) => (
              <div
                key={student.id}
                className="animate-slide-in-up"
                style={{
                  animationDelay: `${(index % 8) * 0.08}s`,
                }}
              >
                {/* LIST VIEW */}
                {viewMode === "list" ? (
                  <div
                    onClick={() => setSelectedStudent(student)}
                    className="
                      group cursor-pointer
                      flex items-center gap-5
                      rounded-[2rem]
                      border border-white/10
                      bg-white/5 backdrop-blur-xl
                      p-5
                      hover:border-netflix-red/30
                      hover:bg-white/[0.07]
                      hover:-translate-y-1
                      transition-all duration-500
                    "
                  >
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="
                          w-full h-full object-cover
                          group-hover:scale-110
                          transition-transform duration-500
                        "
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-xl mb-1 group-hover:text-netflix-red transition">
                        {student.name}
                      </h3>

                      <p className="text-yellow-300 text-sm font-medium mb-2">
                        {student.department}
                      </p>

                      <p className="text-netflix-lightgray text-sm line-clamp-2 leading-relaxed">
                        {student.bio}
                      </p>
                    </div>
                  </div>
                ) : viewMode === "tiles" ? (
                  /* TILES VIEW */
                  <div
                    onClick={() => setSelectedStudent(student)}
                    className="group cursor-pointer"
                  >
                    <div
                      className="
                        relative overflow-hidden
                        rounded-2xl
                        border border-white/10
                        bg-white/5
                        backdrop-blur-xl
                        p-2
                        hover:border-netflix-red/40
                        hover:-translate-y-1
                        transition-all duration-500
                      "
                    >
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="
                            w-full aspect-square object-cover
                            group-hover:scale-110
                            transition-transform duration-500
                          "
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <p className="text-sm font-semibold text-white truncate">
                        {student.name}
                      </p>

                      <p className="text-xs text-netflix-lightgray truncate">
                        {student.department}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* GRID VIEW */
                  <StudentCard
                    student={student}
                    onClick={() => setSelectedStudent(student)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {filteredStudents.length === 0 && (
            <div className="text-center py-24">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Search className="text-netflix-lightgray" size={36} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                No Students Found
              </h3>

              <p className="text-netflix-lightgray text-lg">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* STUDENT MODAL */}
      {selectedStudent && filteredStudents?.length > 0 && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          students={filteredStudents}
          onChangeStudent={setSelectedStudent}
        />
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
