"use client";

import { useState } from "react";
import Image from "next/image";

interface StudentCardProps {
  student: {
    id: number;
    name: string;
    department: string;
    photo: string;
    bio: string;
    lastWord?: string;
    messages?: string[];
  };
  onClick?: () => void;
}

export default function StudentCard({ student, onClick }: StudentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      className="relative group overflow-hidden rounded-lg aspect-[3/4] bg-netflix-black border border-netflix-gray/30 hover:border-netflix-red transition text-left w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Image
        src={student.photo}
        alt={student.name}
        fill
        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
      />

      {/* Dark Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-netflix-black transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-70"
        }`}
      />

      {/* Info */}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-4 transition-all duration-300 ${
          isHovered ? "translate-y-0" : "translate-y-4"
        }`}
      >
        <h3 className="text-lg font-bold text-white mb-1">{student.name}</h3>
        <p className="text-netflix-red text-sm font-semibold mb-2">
          {student.department}
        </p>
        <p
          className={`text-netflix-lightgray text-xs leading-relaxed transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {student.bio}
        </p>
      </div>
    </button>
  );
}
