"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface StudentModalProps {
  student: {
    id: number;
    name: string;
    department: string;
    photo: string;
    bio: string;
    lastWord: string;
    messages: string[];
  };
  students: any[];
  onClose: () => void;
  onChangeStudent: (student: any) => void;
}

export default function StudentModal({
  student,
  students,
  onClose,
  onChangeStudent,
}: StudentModalProps) {
  const startX = useRef(0);
  const isDragging = useRef(false);

  function getIndex() {
    return students.findIndex((s) => s.id === student.id);
  }

  function goNext() {
    const index = getIndex();
    const next = students[index + 1];
    if (next) onChangeStudent(next);
  }

  function goPrev() {
    const index = getIndex();
    const prev = students[index - 1];
    if (prev) onChangeStudent(prev);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const diff = startX.current - e.changedTouches[0].clientX;

        if (diff > 60) goNext();
        if (diff < -60) goPrev();
      }}
      onMouseDown={(e) => {
        startX.current = e.clientX;
        isDragging.current = true;
      }}
      onMouseUp={(e) => {
        if (!isDragging.current) return;

        const diff = startX.current - e.clientX;

        if (diff > 80) goNext();
        if (diff < -80) goPrev();

        isDragging.current = false;
      }}
    >
      <div className="relative bg-netflix-black border border-netflix-gray/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-transform duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded hover:bg-netflix-gray/20 transition"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Image */}
        <div className="relative w-full h-96 bg-netflix-black">
          <Image
            src={student.photo}
            alt={student.name}
            fill
            className="w-full h-full object-contain"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-netflix-black" />
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Student Info */}
          <div>
            <h1
              style={{ fontFamily: "var(--font-elegant)" }}
              className="text-4xl font-bold text-white mb-2"
            >
              {student.name}
            </h1>

            <p
              style={{ fontFamily: "var(--font-modern)" }}
              className="text-netflix-red text-lg font-semibold mb-4"
            >
              {student.department}
            </p>

            <p className="text-netflix-lightgray text-base leading-relaxed">
              {student.bio}
            </p>
          </div>

          {/* Last Word */}
          <div className="border-l-4 border-netflix-red pl-6">
            <p
              style={{ fontFamily: "var(--font-serif)" }}
              className="text-lg text-white italic mb-2"
            >
              "{student.lastWord}"
            </p>
            <p className="text-netflix-gray text-sm">— Final Words</p>
          </div>
        </div>
      </div>
    </div>
  );
}
