"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit, Plus, CheckCircle, XCircle, Eye } from "lucide-react";

interface GalleryItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
  approved: boolean;
}

export default function AdminSharedGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<GalleryItem>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function toggleApproval(item: GalleryItem) {
    await fetch("/api/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...item,
        approved: !item.approved,
      }),
    });

    fetchItems();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    await fetch(`/api/gallery?id=${id}`, {
      method: "DELETE",
    });

    fetchItems();
  }

  async function handleAdd() {
    if (!newItem.url || !newItem.caption) return;

    await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newItem,
        approved: false,
      }),
    });

    setNewItem({});
    setShowAddForm(false);
    fetchItems();
  }

  if (loading) {
    return <div className="text-white text-center py-20">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Gallery Admin</h2>
          <p className="text-gray-400 text-sm">
            Approve and manage all uploaded memories
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(true);
            setNewItem({ type: "image", approved: false });
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl
          bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold hover:scale-105 transition"
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
          <input
            placeholder="Caption"
            className="w-full p-3 rounded-xl bg-black/40 text-white"
            onChange={(e) =>
              setNewItem({ ...newItem, caption: e.target.value })
            }
          />

          <input
            placeholder="Image/Video URL"
            className="w-full p-3 rounded-xl bg-black/40 text-white"
            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
          />

          <select
            className="w-full p-3 rounded-xl bg-black/40 text-white"
            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            value={newItem.type || "image"}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-green-500 text-black font-semibold py-2 rounded-xl"
            >
              Save
            </button>

            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-white/10 text-white py-2 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            {/* MEDIA */}
            <div className="relative aspect-video">
              {item.type === "image" ? (
                <img src={item.url} className="w-full h-full object-cover" />
              ) : (
                <video src={item.url} className="w-full h-full object-cover" />
              )}

              <div
                className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                  item.approved
                    ? "bg-green-500/20 text-green-300"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                {item.approved ? "Approved" : "Pending"}
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-3">
              <p className="text-white font-semibold truncate">
                {item.caption}
              </p>

              {/* ACTIONS */}
              <div className="flex justify-between items-center">
                {/* APPROVE */}
                <button
                  onClick={() => toggleApproval(item)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    item.approved
                      ? "bg-red-500/20 text-red-300"
                      : "bg-green-500/20 text-green-300"
                  }`}
                >
                  {item.approved ? "Unapprove" : "Approve"}
                </button>

                {/* ICONS */}
                <div className="flex gap-2">
                  {/* EDIT */}
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-300"
                  >
                    <Edit size={14} />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-black/80 border border-white/10 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h2 className="text-white text-xl font-bold">Edit Item</h2>

            <input
              value={editingItem.caption}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  caption: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-white/10 text-white"
            />

            <input
              value={editingItem.url}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  url: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-white/10 text-white"
            />

            <select
              value={editingItem.type}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  type: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-white/10 text-white"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await fetch("/api/gallery", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editingItem),
                  });

                  setEditingItem(null);
                  fetchItems();
                }}
                className="flex-1 bg-green-500 text-black font-semibold py-2 rounded-xl"
              >
                Save
              </button>

              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 bg-white/10 text-white py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
