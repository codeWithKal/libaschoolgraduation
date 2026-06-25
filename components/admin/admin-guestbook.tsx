"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Check, X, RefreshCw } from "lucide-react";

interface GuestbookMessage {
  id: string;
  author_name: string;
  message: string;
  emoji_reaction?: string;
  approved: boolean;
  created_at: string;
}

export default function AdminGuestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/guestbook/admin");
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      const response = await fetch(`/api/guestbook`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved: true }),
      });

      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, approved: true } : msg)),
        );
      }
    } catch (error) {
      console.error("Error approving message:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await fetch(`/api/guestbook?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  const pendingMessages = messages.filter((msg) => !msg.approved);
  const approvedMessages = messages.filter((msg) => msg.approved);

  if (loading) {
    return (
      <div className="text-white text-center py-12">
        <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-12">
        <p>{error}</p>
        <button
          onClick={fetchMessages}
          className="mt-4 px-4 py-2 bg-netflix-red/20 hover:bg-netflix-red/30 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-yellow-400 text-sm">Pending Approval</p>
          <p className="text-2xl font-bold text-white">
            {pendingMessages.length}
          </p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-green-400 text-sm">Approved</p>
          <p className="text-2xl font-bold text-white">
            {approvedMessages.length}
          </p>
        </div>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="text-center text-netflix-lightgray py-12">
          No messages found
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-netflix-black border rounded-lg p-6 transition-colors ${
                msg.approved
                  ? "border-green-500/30 hover:border-green-500/60"
                  : "border-yellow-500/30 hover:border-yellow-500/60"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif font-bold text-netflix-red">
                      {msg.author_name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        msg.approved
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {msg.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-netflix-lightgray text-sm">
                    {new Date(msg.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {msg.emoji_reaction && (
                  <span className="text-2xl">{msg.emoji_reaction}</span>
                )}
              </div>

              {/* Message */}
              <p className="text-white mb-4 leading-relaxed">{msg.message}</p>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-netflix-gray/30">
                {!msg.approved && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApprove(msg.id)}
                    className="flex-1 bg-green-600/20 border border-green-600 text-green-400 py-2 rounded hover:bg-green-600/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Approve
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(msg.id)}
                  className="flex-1 bg-red-600/20 border border-red-600 text-red-400 py-2 rounded hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
