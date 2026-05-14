"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { MessageCircle, Menu, X, Send, Sparkles, Heart } from "lucide-react";

interface GuestbookMessage {
  id: string;
  author_name: string;
  message: string;
  emoji_reaction?: string;
  created_at: string;
}

const EMOJI_OPTIONS = ["❤️", "🎉", "✨", "👏", "🌟", "🥳"];

export default function GuestbookPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [formLoading, setFormLoading] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("✨");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch("/api/guestbook");

        const data = await res.json();

        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error("Invalid API response:", data);
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
        setMessages([]);
      }
    }

    loadMessages();
  }, []);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author_name: authorName.trim(),
          message: messageText.trim(),
          emoji_reaction: selectedEmoji,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      const newMessage = await res.json();

      setMessages((prev) => [newMessage, ...prev]);

      setSuccess("Your wishes have been shared successfully.");

      setAuthorName("");
      setMessageText("");
      setSelectedEmoji("✨");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-netflix-dark overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-netflix-red/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 blur-3xl rounded-full" />
      </div>

      {/* Mobile Menu */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-netflix-black/60 backdrop-blur border border-white/10 text-white transition hover:scale-105"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="relative pt-24 px-4 md:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* HERO */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mb-6">
              <Sparkles size={16} />
              Graduation Celebration Wall
            </div>

            <h1
              style={{ fontFamily: "var(--font-display)" }}
              className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
            >
              Graduation
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-netflix-red via-yellow-400 to-yellow-200">
                Guestbook
              </span>
            </h1>

            <p className="text-netflix-lightgray text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Share your wishes, memories, and congratulations for the NOVAREING
              graduating class.
            </p>
          </div>

          {/* MAIN GRID */}
          <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">
            {/* FORM CARD */}
            <div className="sticky top-24">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-netflix-red/10 via-transparent to-yellow-500/10 pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-netflix-red/20 flex items-center justify-center">
                      <Heart className="text-netflix-red" size={22} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Leave a Message
                      </h2>

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
                        "Sending Wishes..."
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
            </div>

            {/* MESSAGES */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                  <MessageCircle className="text-yellow-400" size={22} />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Celebration Messages
                  </h2>

                  <p className="text-netflix-lightgray">
                    {messages.length} shared wishes
                  </p>
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-16 text-center">
                  <MessageCircle
                    className="mx-auto mb-6 text-netflix-red"
                    size={60}
                  />

                  <h3 className="text-2xl font-bold text-white mb-3">
                    No Messages Yet
                  </h3>

                  <p className="text-netflix-lightgray">
                    Be the first person to leave a congratulatory message.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-netflix-red/40 transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Hover Glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-netflix-red/5 via-transparent to-yellow-500/5 transition duration-500" />

                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-netflix-red to-red-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {msg.author_name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <h3 className="font-bold text-white text-lg">
                                {msg.author_name}
                              </h3>

                              <p className="text-netflix-gray text-sm">
                                {new Date(msg.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="text-3xl">{msg.emoji_reaction}</div>
                        </div>

                        <p className="text-netflix-lightgray leading-relaxed text-[15px]">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
