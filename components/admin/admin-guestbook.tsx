"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface GuestbookMessage {
  id: string;
  author_name: string;
  message: string;
  emoji_reaction?: string;
  created_at: string;
}

export default function AdminGuestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const response = await fetch("/api/guestbook");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
    setLoading(false);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Guestbook Management</h2>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-white text-center py-12">Loading messages...</div>
      ) : messages.length === 0 ? (
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
              className="bg-netflix-black border border-netflix-gray/30 rounded-lg p-6 hover:border-netflix-red/40 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-serif font-bold text-netflix-red">
                    {msg.author_name}
                  </h3>

                  <p className="text-netflix-lightgray text-sm">
                    {new Date(msg.created_at).toLocaleDateString()}
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
