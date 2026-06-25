// app/guestbook/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Menu, X, Sparkles, Heart, Loader2 } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { GuestbookForm } from "@/components/guestbook/GuestbookForm";
import { GuestbookMessageItem } from "@/components/guestbook/GuestbookMessage";
import { InfiniteScrollLoader } from "@/components/InfiniteScrollLoader";
import { useGuestbookData } from "@/hooks/useGuestbookData";

export default function GuestbookPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    messages,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    loadMore,
    refresh,
  } = useGuestbookData({
    limit: 20,
    approved: true,
  });

  // Show error state with retry
  if (error) {
    return (
      <div className="min-h-screen bg-netflix-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={refresh}
            className="px-6 py-3 bg-netflix-red text-white rounded-xl hover:bg-red-600 transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
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
          </motion.div>

          {/* MAIN GRID */}
          <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">
            {/* FORM CARD */}
            <div className="sticky top-24">
              <GuestbookForm onSuccess={refresh} />
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
                    {loading ? "Loading..." : `${total} approved wishes`}
                  </p>
                </div>
              </div>

              {/* Messages List with Infinite Scroll */}
              <InfiniteScrollLoader
                onLoadMore={loadMore}
                hasMore={hasMore}
                loading={loadingMore}
              >
                {loading ? (
                  /* Loading State */
                  <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-16 text-center">
                    <Loader2
                      className="mx-auto mb-6 text-netflix-red animate-spin"
                      size={60}
                    />
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Loading Messages...
                    </h3>
                    <p className="text-netflix-lightgray">
                      Please wait while we load the celebration wishes.
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  /* No Messages State */
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
                  /* Messages List */
                  <div className="space-y-6">
                    {messages.map((msg, index) => (
                      <GuestbookMessageItem
                        key={msg.id}
                        message={msg}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </InfiniteScrollLoader>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
