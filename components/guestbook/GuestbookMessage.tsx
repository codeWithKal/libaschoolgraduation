// components/guestbook/GuestbookMessage.tsx
"use client";

import { motion } from "framer-motion";
import { GuestbookMessage } from "@/hooks/useGuestbookData";

interface GuestbookMessageProps {
  message: GuestbookMessage;
  index: number;
}

export function GuestbookMessageItem({
  message,
  index,
}: GuestbookMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-netflix-red/40 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-netflix-red/5 via-transparent to-yellow-500/5 transition duration-500" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-netflix-red to-red-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {message.author_name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="font-bold text-white text-lg">
                {message.author_name}
              </h3>

              <p className="text-netflix-gray text-sm">
                {new Date(message.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="text-3xl">{message.emoji_reaction}</div>
        </div>

        <p className="text-netflix-lightgray leading-relaxed text-[15px]">
          {message.message}
        </p>
      </div>
    </motion.div>
  );
}
