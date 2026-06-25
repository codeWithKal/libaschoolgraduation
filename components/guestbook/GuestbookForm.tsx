// components/guestbook/GuestbookForm.tsx
"use client";

import { useState } from "react";
import { Send, Heart, Loader2 } from "lucide-react";

const EMOJI_OPTIONS = ["❤️", "🎉", "✨", "👏", "🌟", "🥳"];

interface GuestbookFormProps {
  onSuccess?: () => void;
}

export function GuestbookForm({ onSuccess }: GuestbookFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("✨");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setFormLoading(true);

    if (!authorName.trim() || !messageText.trim()) {
      setError("Please fill in all fields.");
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: authorName.trim(),
          message: messageText.trim(),
          emoji_reaction: selectedEmoji,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit");
      }

      setSuccess(
        "✅ Your message has been sent for admin approval. It will appear here once approved.",
      );

      setAuthorName("");
      setMessageText("");
      setSelectedEmoji("✨");

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/10 via-transparent to-yellow-500/10 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-netflix-red/20 flex items-center justify-center">
            <Heart className="text-netflix-red" size={22} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Leave a Message</h2>
            <p className="text-netflix-lightgray text-sm">
              Celebrate the journey together
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NAME */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-4 rounded-2xl bg-netflix-black/60 border border-white/10 text-white placeholder-netflix-lightgray focus:outline-none focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/20 transition"
            />
          </div>

          {/* MESSAGE */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Your Message
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your congratulatory message..."
              rows={6}
              className="w-full px-4 py-4 rounded-2xl bg-netflix-black/60 border border-white/10 text-white placeholder-netflix-lightgray focus:outline-none focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/20 transition resize-none"
            />
          </div>

          {/* EMOJIS */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Reaction
            </label>
            <div className="flex flex-wrap gap-3">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-12 h-12 rounded-2xl text-2xl transition-all duration-300 ${
                    selectedEmoji === emoji
                      ? "bg-netflix-red/20 border border-netflix-red scale-110"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* ALERTS */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-2xl px-4 py-3 text-sm">
              {success}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-gradient-to-r from-netflix-yellow to-yellow-400 hover:scale-[1.02] text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-red-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {formLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending Wishes...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Wishes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
