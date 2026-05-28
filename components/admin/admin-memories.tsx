"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Trash2,
  Edit,
  Plus,
  X,
  Check,
  Image as ImageIcon,
  Video,
  Filter,
  Upload,
  Sparkles,
  Search,
  Play,
  ImagePlus,
  Loader2,
  Pencil,
  Eye,
} from "lucide-react";

// Lazy load Lightbox component
const LightBox = dynamic(() => import("@/components/lightbox"), {
  loading: () => null,
  ssr: false,
});

interface Memory {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
  day?: string;
  thumbnail?: string;
}

const DAYS = ["Gabi Day", "Photoshoot Day", "Welcome Day"];

const DAY_FILE_MAP: Record<string, string> = {
  "Gabi Day": "/api/data/gabi_day.json",
  "Photoshoot Day": "/api/data/photoshot_day.json",
  "Welcome Day": "/api/data/welcome_day.json",
};

export default function AdminMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<"all" | "image" | "video">(
    "all",
  );
  const [selectedMemories, setSelectedMemories] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [lightboxMedia, setLightboxMedia] = useState<Memory | null>(null);

  const [form, setForm] = useState<Partial<Memory>>({
    type: "image",
    day: "Gabi Day",
  });

  const cache = useRef<Record<string, Memory[]>>({});

  useEffect(() => {
    fetchMemories();
  }, [selectedDay]);

  async function fetchMemories() {
    setLoading(true);

    try {
      let result: Memory[] = [];

      if (selectedDay !== "all" && cache.current[selectedDay]) {
        setMemories(cache.current[selectedDay]);
        setLoading(false);
        return;
      }

      if (selectedDay === "all") {
        const files = Object.values(DAY_FILE_MAP);
        const responses = await Promise.all(
          files.map((file) => fetch(file).then((r) => r.json())),
        );
        result = responses.flat();
      } else {
        const res = await fetch(DAY_FILE_MAP[selectedDay]);
        result = await res.json();
        cache.current[selectedDay] = result;
      }

      setMemories(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Error loading memories:", err);
      setMemories([]);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ type: "image", day: "Gabi Day" });
    setImagePreview("");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size should be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setForm((prev) => ({
        ...prev,
        url: result,
      }));
    };
    reader.readAsDataURL(file);
  }

  async function addMemory() {
    if (!form.url || !form.caption) {
      alert("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    try {
      await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setShowAddForm(false);
      resetForm();
      if (form.day) {
        delete cache.current[form.day];
      }
      fetchMemories();
    } catch (error) {
      console.error("Error adding memory:", error);
      alert("Failed to add memory");
    } finally {
      setIsUploading(false);
    }
  }

  function startEditingCaption(memory: Memory) {
    setEditingMemoryId(memory.id);
    setEditingCaption(memory.caption);
  }

  async function saveCaption(memory: Memory) {
    if (!editingCaption.trim()) {
      alert("Caption cannot be empty");
      return;
    }

    try {
      const updatedMemory = {
        ...memory,
        caption: editingCaption.trim(),
      };

      await fetch("/api/memories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMemory),
      });

      setMemories((prev) =>
        prev.map((m) =>
          m.id === memory.id ? { ...m, caption: editingCaption.trim() } : m,
        ),
      );

      if (memory.day) {
        delete cache.current[memory.day];
      }

      setEditingMemoryId(null);
      setEditingCaption("");
    } catch (error) {
      console.error("Error updating caption:", error);
      alert("Failed to update caption");
    }
  }

  function cancelEditing() {
    setEditingMemoryId(null);
    setEditingCaption("");
  }

  async function deleteMemory(id: number, day: string) {
    if (
      !confirm(
        "Are you sure you want to delete this memory? This action cannot be undone.",
      )
    )
      return;

    try {
      await fetch(`/api/memories?id=${id}&day=${day}`, {
        method: "DELETE",
      });

      delete cache.current[day];
      fetchMemories();
    } catch (error) {
      console.error("Error deleting memory:", error);
      alert("Failed to delete memory");
    }
  }

  async function deleteSelected() {
    if (selectedMemories.length === 0) return;
    if (!confirm(`Delete ${selectedMemories.length} selected memories?`))
      return;

    try {
      const selectedMemoriesList = memories.filter((m) =>
        selectedMemories.includes(m.id),
      );
      const daysToClear = new Set(selectedMemoriesList.map((m) => m.day));

      await Promise.all(
        selectedMemories.map((id) => {
          const memory = memories.find((m) => m.id === id);
          return fetch(
            `/api/memories?id=${id}&day=${memory?.day || selectedDay}`,
            {
              method: "DELETE",
            },
          );
        }),
      );

      daysToClear.forEach((day) => {
        if (day) delete cache.current[day];
      });

      setSelectedMemories([]);
      fetchMemories();
    } catch (error) {
      console.error("Error deleting memories:", error);
    }
  }

  function toggleMemorySelection(id: number) {
    setSelectedMemories((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  function handleCaptionKeyDown(e: React.KeyboardEvent, memory: Memory) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveCaption(memory);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  }

  const filteredMemories = useMemo(() => {
    return memories.filter((memory) => {
      const matchesSearch = memory.caption
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesType = mediaFilter === "all" || memory.type === mediaFilter;

      return matchesSearch && matchesType;
    });
  }, [memories, searchQuery, mediaFilter]);

  const stats = {
    total: memories.length,
    images: memories.filter((m) => m.type === "image").length,
    videos: memories.filter((m) => m.type === "video").length,
  };

  return (
    <div className="space-y-8 text-white max-w-7xl mx-auto">
      {/* Lightbox */}
      {lightboxMedia && (
        <LightBox
          media={lightboxMedia}
          onClose={() => setLightboxMedia(null)}
        />
      )}

      {/* HEADER */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Memory Studio</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  Manage graduation memories across event days
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedMemories.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={deleteSelected}
                className="bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Trash2 size={16} />
                Delete ({selectedMemories.length})
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowAddForm(true);
                resetForm();
              }}
              className="bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-red-700 px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 shadow-lg shadow-netflix-red/25"
            >
              <Plus size={18} />
              Add Memory
            </motion.button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <ImageIcon size={16} className="text-gray-400" />
            <span className="text-sm text-gray-300">{stats.total} Total</span>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <ImagePlus size={16} className="text-blue-400" />
            <span className="text-sm text-gray-300">{stats.images} Images</span>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Video size={16} className="text-purple-400" />
            <span className="text-sm text-gray-300">{stats.videos} Videos</span>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-wrap gap-2">
            {["all", ...DAYS].map((day) => (
              <motion.button
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedDay(day);
                  setSelectedMemories([]);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedDay === day
                    ? "bg-gradient-to-r from-netflix-red to-red-600 text-white shadow-lg shadow-netflix-red/25"
                    : "bg-zinc-900 border border-zinc-800 text-gray-400 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {day === "all" ? "All Days" : day}
              </motion.button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex gap-2">
            {(["all", "image", "video"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMediaFilter(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  mediaFilter === type
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-900 text-gray-400 hover:text-white"
                }`}
              >
                {type === "all" && <Filter size={14} />}
                {type === "image" && <ImageIcon size={14} />}
                {type === "video" && <Video size={14} />}
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-64 bg-zinc-900 border border-zinc-800 focus:border-netflix-red focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm transition-colors"
            />
          </div>
        </div>

        {(mediaFilter !== "all" || searchQuery) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
            <span className="text-xs text-gray-500">Active filters:</span>
            {mediaFilter !== "all" && (
              <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs flex items-center gap-1">
                <span className="capitalize">{mediaFilter}</span>
                <button
                  onClick={() => setMediaFilter("all")}
                  className="hover:text-netflix-red transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs flex items-center gap-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-netflix-red transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ADD FORM MODAL */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-zinc-900/50 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Create New Memory</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Add a photo or video memory
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Media Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setForm((p) => ({ ...p, type: "image" }))
                        }
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                          form.type === "image"
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-900 text-gray-400 hover:text-white"
                        }`}
                      >
                        <ImageIcon size={16} />
                        Image
                      </button>
                      <button
                        onClick={() =>
                          setForm((p) => ({ ...p, type: "video" }))
                        }
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                          form.type === "video"
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-900 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Video size={16} />
                        Video
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Event Day
                    </label>
                    <select
                      value={form.day}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, day: e.target.value }))
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-netflix-red focus:outline-none rounded-xl p-3 text-sm transition-colors"
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    {form.type === "image" ? "Upload Image" : "Video URL"}
                  </label>

                  {form.type === "image" ? (
                    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-700 hover:border-netflix-red transition-colors bg-zinc-900 rounded-2xl p-8 cursor-pointer">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 rounded-xl object-cover"
                        />
                      ) : (
                        <>
                          <Upload size={32} className="text-gray-500" />
                          <div className="text-center">
                            <p className="text-gray-300 font-medium">
                              Click to upload image
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              PNG, JPG or WebP (max 10MB)
                            </p>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileUpload}
                      />
                    </label>
                  ) : (
                    <input
                      type="text"
                      placeholder="https://example.com/video.mp4"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-netflix-red focus:outline-none rounded-xl p-3 text-sm transition-colors"
                      onChange={(e) =>
                        setForm((p) => ({ ...p, url: e.target.value }))
                      }
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Caption *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a descriptive caption..."
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-netflix-red focus:outline-none rounded-xl p-3 text-sm transition-colors"
                    onChange={(e) =>
                      setForm((p) => ({ ...p, caption: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Student ID (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="Associated student ID"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-netflix-red focus:outline-none rounded-xl p-3 text-sm transition-colors"
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        studentId: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="bg-zinc-900/50 border-t border-zinc-800 px-6 py-4 flex gap-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addMemory}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-red-700 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Create Memory
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEMORIES GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-netflix-red mb-4" />
          <p className="text-gray-400">Loading memories...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={32} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Memories Found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery || mediaFilter !== "all"
              ? "No memories match your filters"
              : "Start by adding your first memory"}
          </p>
          {!searchQuery && mediaFilter === "all" ? (
            <button
              onClick={() => {
                setShowAddForm(true);
                resetForm();
              }}
              className="bg-netflix-red hover:bg-red-700 px-6 py-2.5 rounded-xl inline-flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Add Memory
            </button>
          ) : (
            <button
              onClick={() => {
                setMediaFilter("all");
                setSearchQuery("");
              }}
              className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2.5 rounded-xl inline-flex items-center gap-2 transition-colors"
            >
              <Filter size={16} />
              Clear Filters
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-400">
            Showing {filteredMemories.length} of {memories.length} memories
            {searchQuery && ` matching "${searchQuery}"`}
            {mediaFilter !== "all" && ` (${mediaFilter}s only)`}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMemories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative bg-zinc-950 border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  selectedMemories.includes(memory.id)
                    ? "border-netflix-red ring-2 ring-netflix-red/20"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {/* Selection Checkbox */}
                <div
                  className="absolute top-3 left-3 z-10 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMemorySelection(memory.id);
                  }}
                >
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedMemories.includes(memory.id)
                        ? "bg-netflix-red border-netflix-red"
                        : "border-white/30 bg-black/50 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {selectedMemories.includes(memory.id) && (
                      <Check size={14} className="text-white" />
                    )}
                  </div>
                </div>

                {/* Preview Button */}
                <button
                  onClick={() => setLightboxMedia(memory)}
                  className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-black/70 backdrop-blur-sm flex items-center justify-center hover:bg-netflix-red transition-colors">
                    <Eye size={16} className="text-white" />
                  </div>
                </button>

                {/* Media Preview */}
                <div
                  className="relative h-48 bg-black overflow-hidden cursor-pointer"
                  onClick={() => setLightboxMedia(memory)}
                >
                  {memory.type === "image" ? (
                    <img
                      src={memory.url}
                      alt={memory.caption}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      {memory.thumbnail ? (
                        <img
                          src={memory.thumbnail}
                          alt={memory.caption}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <video
                          src={memory.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <Play size={20} className="text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm ${
                        memory.type === "image"
                          ? "bg-blue-500/80 text-white"
                          : "bg-purple-500/80 text-white"
                      }`}
                    >
                      {memory.type === "image" ? (
                        <ImageIcon size={12} />
                      ) : (
                        <Video size={12} />
                      )}
                    </span>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info Section */}
                <div className="p-4 space-y-3">
                  {editingMemoryId === memory.id ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          onKeyDown={(e) => handleCaptionKeyDown(e, memory)}
                          className="w-full bg-zinc-900 border-2 border-netflix-red focus:outline-none rounded-xl p-2.5 pr-16 text-sm transition-colors"
                          placeholder="Enter caption..."
                          autoFocus
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            onClick={() => saveCaption(memory)}
                            className="p-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            title="Save (Enter)"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                            title="Cancel (Esc)"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Press{" "}
                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs">
                          Enter
                        </kbd>{" "}
                        to save •{" "}
                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs">
                          Esc
                        </kbd>{" "}
                        to cancel
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-sm line-clamp-2">
                        {memory.caption}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-500">
                          ID: {memory.studentId || "N/A"}
                        </span>
                        {memory.day && (
                          <>
                            <span className="text-gray-700">•</span>
                            <span className="text-xs text-gray-500">
                              {memory.day}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {editingMemoryId !== memory.id && (
                      <>
                        <button
                          onClick={() => startEditingCaption(memory)}
                          className="flex-1 bg-zinc-900 hover:bg-zinc-800 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => setLightboxMedia(memory)}
                          className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                        >
                          <Eye size={12} />
                          Preview
                        </button>
                      </>
                    )}
                    <button
                      onClick={() =>
                        deleteMemory(memory.id, memory.day || selectedDay)
                      }
                      className={`${
                        editingMemoryId === memory.id ? "flex-1" : "flex-1"
                      } bg-red-600/10 hover:bg-red-600/20 text-red-400 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-colors`}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
