"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Image as ImageIcon,
  Video,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Image from "next/image";

// Lazy load Lightbox for better performance
const LightBox = dynamic(() => import("@/components/lightbox"), {
  loading: () => null,
  ssr: false,
});

interface GalleryItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
  approved: boolean;
  day?: string; // Add optional day property
}

// Toast notification component
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {message}
    </motion.div>
  );
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 animate-pulse"
        >
          <div className="aspect-video bg-white/10" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="flex justify-between">
              <div className="h-8 bg-white/10 rounded w-20" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-white/10 rounded" />
                <div className="h-8 w-8 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Media Preview Component
const MediaPreview = memo(function MediaPreview({
  item,
  onPreview,
}: {
  item: GalleryItem;
  onPreview: (item: GalleryItem) => void;
}) {
  const [error, setError] = useState(false);
  const isVideo = item.type === "video";

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        {isVideo ? (
          <Video className="text-gray-500" size={32} />
        ) : (
          <ImageIcon className="text-gray-500" size={32} />
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full cursor-pointer group"
      onClick={() => onPreview(item)}
    >
      {isVideo ? (
        <video
          src={item.url}
          className="w-full h-full object-cover"
          preload="metadata"
          onError={() => setError(true)}
          muted
          playsInline
        />
      ) : (
        <Image
          src={item.url}
          alt={item.caption || "Gallery item"}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setError(true)}
        />
      )}

      {/* Eye icon overlay on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-black/70 backdrop-blur-sm rounded-full p-3">
          <Eye size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
});

// Edit Modal Component
const EditModal = memo(function EditModal({
  item,
  onSave,
  onClose,
}: {
  item: GalleryItem;
  onSave: (item: GalleryItem) => Promise<void>;
  onClose: () => void;
}) {
  const [editedItem, setEditedItem] = useState(item);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(editedItem);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-white/10 p-6 rounded-2xl w-full max-w-md space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Edit Item</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Caption</label>
            <input
              value={editedItem.caption}
              onChange={(e) =>
                setEditedItem({ ...editedItem, caption: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-yellow-500/50 focus:outline-none transition"
              placeholder="Enter caption..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle size={18} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition border border-white/10"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

// Main Component
export default function AdminSharedGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<GalleryItem>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "approved" | "pending"
  >("all");
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  // Fetch items with error handling
  const fetchItems = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError("Failed to load gallery items. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Toggle approval with loading state
  const toggleApproval = useCallback(
    async (item: GalleryItem, e?: React.MouseEvent) => {
      e?.stopPropagation();

      setProcessingIds((prev) => new Set(prev).add(item.id));

      try {
        const res = await fetch("/api/gallery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...item,
            approved: !item.approved,
          }),
        });

        if (!res.ok) throw new Error("Failed to update item");

        setToast({
          message: item.approved
            ? "Item unapproved successfully"
            : "Item approved successfully",
          type: "success",
        });

        await fetchItems();
      } catch (err) {
        setToast({
          message: "Failed to update item. Please try again.",
          type: "error",
        });
        console.error(err);
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    },
    [fetchItems],
  );

  // Delete item with confirmation
  const handleDelete = useCallback(
    async (id: number) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this item? This action cannot be undone.",
        )
      )
        return;

      setProcessingIds((prev) => new Set(prev).add(id));

      try {
        const res = await fetch(`/api/gallery?id=${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete item");

        setToast({
          message: "Item deleted successfully",
          type: "success",
        });

        await fetchItems();
      } catch (err) {
        setToast({
          message: "Failed to delete item. Please try again.",
          type: "error",
        });
        console.error(err);
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [fetchItems],
  );

  // Add new item
  const handleAdd = useCallback(async () => {
    if (!newItem.url || !newItem.caption) {
      setToast({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          approved: false,
          type: newItem.type || "image",
        }),
      });

      if (!res.ok) throw new Error("Failed to add item");

      setToast({
        message: "Item added successfully",
        type: "success",
      });

      setNewItem({});
      setShowAddForm(false);
      await fetchItems();
    } catch (err) {
      setToast({
        message: "Failed to add item. Please try again.",
        type: "error",
      });
      console.error(err);
    }
  }, [newItem, fetchItems]);

  // Edit item
  const handleEditSave = useCallback(
    async (editedItem: GalleryItem) => {
      try {
        const res = await fetch("/api/gallery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editedItem),
        });

        if (!res.ok) throw new Error("Failed to update item");

        setToast({
          message: "Item updated successfully",
          type: "success",
        });

        setEditingItem(null);
        await fetchItems();
      } catch (err) {
        setToast({
          message: "Failed to update item. Please try again.",
          type: "error",
        });
        console.error(err);
      }
    },
    [fetchItems],
  );

  // Filter and search items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "approved" && item.approved) ||
      (filterStatus === "pending" && !item.approved);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const stats = {
    total: items.length,
    approved: items.filter((i) => i.approved).length,
    pending: items.filter((i) => !i.approved).length,
    images: items.filter((i) => i.type === "image").length,
    videos: items.filter((i) => i.type === "video").length,
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-white/10 rounded w-48 animate-pulse mb-2" />
            <div className="h-4 bg-white/10 rounded w-64 animate-pulse" />
          </div>
          <div className="h-10 bg-white/10 rounded w-24 animate-pulse" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchItems}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Lightbox */}
      <AnimatePresence>
        {previewItem && (
          <LightBox media={previewItem} onClose={() => setPreviewItem(null)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Gallery Admin</h2>
            <p className="text-gray-400 text-sm mt-1">
              Manage and approve uploaded memories
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchItems}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>

            <button
              onClick={() => {
                setShowAddForm(true);
                setNewItem({ type: "image", approved: false });
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold 
              hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add New</span>
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "bg-blue-500/20 text-blue-300",
            },
            {
              label: "Approved",
              value: stats.approved,
              color: "bg-green-500/20 text-green-300",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "bg-yellow-500/20 text-yellow-300",
            },
            {
              label: "Videos",
              value: stats.videos,
              color: "bg-purple-500/20 text-purple-300",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} rounded-xl p-3 border border-white/10`}
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs opacity-75">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              placeholder="Search by caption or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-yellow-500/50 focus:outline-none transition"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-yellow-500/50 focus:outline-none transition"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* ADD FORM */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                <h3 className="text-white font-semibold mb-2">Add New Item</h3>

                <input
                  placeholder="Caption *"
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition"
                  onChange={(e) =>
                    setNewItem({ ...newItem, caption: e.target.value })
                  }
                  value={newItem.caption || ""}
                />

                <input
                  placeholder="Image/Video URL *"
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:outline-none transition"
                  onChange={(e) =>
                    setNewItem({ ...newItem, url: e.target.value })
                  }
                  value={newItem.url || ""}
                />

                <select
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-yellow-500/50 focus:outline-none transition"
                  onChange={(e) =>
                    setNewItem({ ...newItem, type: e.target.value })
                  }
                  value={newItem.type || "image"}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-xl transition active:scale-95"
                  >
                    Add Item
                  </button>

                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem({});
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition border border-white/10 active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GRID */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="text-gray-500 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">No items found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Click 'Add New' to create your first item"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl hover:border-yellow-500/30 transition-all duration-300"
              >
                {/* MEDIA */}
                <div className="relative aspect-video bg-gray-900">
                  <MediaPreview item={item} onPreview={setPreviewItem} />

                  {/* Status Badge */}
                  <div
                    className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      item.approved
                        ? "bg-green-500/30 text-green-300 border border-green-500/30"
                        : "bg-yellow-500/30 text-yellow-300 border border-yellow-500/30"
                    }`}
                  >
                    {item.approved ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} />
                        Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" />
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-xs font-medium text-white/80 border border-white/10">
                    {item.type === "video" ? (
                      <Video size={14} />
                    ) : (
                      <ImageIcon size={14} />
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-white font-semibold truncate mb-1">
                      {item.caption}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{item.url}</p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Preview Button */}
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold
                      bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 
                      transition-all duration-200 active:scale-95
                      flex items-center justify-center gap-2 border border-blue-500/30"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">Preview</span>
                    </button>

                    {/* Approve Button */}
                    <button
                      onClick={(e) => toggleApproval(item, e)}
                      disabled={processingIds.has(item.id)}
                      className={`
                        px-4 py-2.5 rounded-xl text-sm font-semibold
                        transition-all duration-200 active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2
                        ${
                          item.approved
                            ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                            : "bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"
                        }
                      `}
                    >
                      {processingIds.has(item.id) ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : item.approved ? (
                        <XCircle size={14} />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      <span className="hidden sm:inline">
                        {item.approved ? "Unapprove" : "Approve"}
                      </span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2.5 rounded-xl bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={processingIds.has(item.id)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
                      title="Delete"
                    >
                      {processingIds.has(item.id) ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* EDIT MODAL */}
        <AnimatePresence>
          {editingItem && (
            <EditModal
              item={editingItem}
              onSave={handleEditSave}
              onClose={() => setEditingItem(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
