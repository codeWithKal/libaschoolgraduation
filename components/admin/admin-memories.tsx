"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit, Plus, X, Check } from "lucide-react";

interface Memory {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
}

const DAYS = ["Gabi Day", "Crazy Day", "Trip Day"];

const DAY_FILE_MAP: Record<string, string> = {
  "Gabi Day": "/data/gabi_day.json",
  "Crazy Day": "/data/crazy_day.json",
  "Trip Day": "/data/trip_day.json",
};

export default function AdminMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

  const [form, setForm] = useState<Partial<Memory>>({
    type: "image",
  });

  const cache = useRef<Record<string, Memory[]>>({});

  useEffect(() => {
    fetchMemories();
  }, [selectedDay]);

  async function fetchMemories() {
    setLoading(true);

    try {
      let result: Memory[] = [];

      // ⚡ use cache for fast switching
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
    setForm({ type: "image" });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        url: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  }

  async function addMemory() {
    if (!form.url || !form.caption) return;

    await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setShowAddForm(false);
    resetForm();
    fetchMemories();
  }

  async function updateMemory() {
    if (!editingMemory) return;

    await fetch("/api/memories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingMemory),
    });

    setEditingMemory(null);
    fetchMemories();
  }

  async function deleteMemory(id: number, day: string) {
    if (!confirm("Delete this memory?")) return;

    await fetch(`/api/memories?id=${id}&day=${day}`, {
      method: "DELETE",
    });

    fetchMemories();
  }

  return (
    <div className="space-y-6 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Memory Studio</h1>
          <p className="text-gray-400 text-sm">
            Manage graduation memories across event days
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(true);
            resetForm();
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          <Plus size={16} />
          Add Memory
        </button>
      </div>

      {/* FILTER */}
      <div className="flex flex-wrap gap-2">
        {["all", ...DAYS].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              selectedDay === day
                ? "bg-red-600"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Create Memory</h2>
            <button onClick={() => setShowAddForm(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <select
              className="bg-zinc-800 p-2 rounded"
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>

            {form.type === "image" ? (
              <input type="file" onChange={handleFileUpload} />
            ) : (
              <input
                className="bg-zinc-800 p-2 rounded"
                placeholder="Video URL"
                onChange={(e) =>
                  setForm((p) => ({ ...p, url: e.target.value }))
                }
              />
            )}

            <input
              className="bg-zinc-800 p-2 rounded"
              placeholder="Caption"
              onChange={(e) =>
                setForm((p) => ({ ...p, caption: e.target.value }))
              }
            />
          </div>

          <button
            onClick={addMemory}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Save
          </button>
        </motion.div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="text-gray-400">Loading memories...</div>
      ) : memories.length === 0 ? (
        <div className="text-gray-500">No memories found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
            >
              {/* EDIT MODE */}
              {editingMemory?.id === m.id ? (
                <div className="p-4 space-y-3">
                  <input
                    className="w-full bg-zinc-800 p-2 rounded"
                    value={editingMemory.caption}
                    onChange={(e) =>
                      setEditingMemory({
                        ...editingMemory,
                        caption: e.target.value,
                      })
                    }
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={updateMemory}
                      className="bg-green-600 px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Check size={14} />
                      Save
                    </button>

                    <button
                      onClick={() => setEditingMemory(null)}
                      className="bg-zinc-700 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* MEDIA */}
                  <div className="h-48 bg-black">
                    {m.type === "image" ? (
                      <img src={m.url} className="w-full h-full object-cover" />
                    ) : (
                      <video
                        src={m.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                  </div>

                  {/* INFO */}
                  <div className="p-4 space-y-2">
                    <p className="font-medium truncate">{m.caption}</p>

                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">
                        Student #{m.studentId}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setEditingMemory(m)}
                        className="flex items-center gap-1 text-sm bg-zinc-800 px-3 py-1 rounded"
                      >
                        <Edit size={14} /> Edit
                      </button>

                      <button
                        onClick={() => deleteMemory(m.id, selectedDay)}
                        className="flex items-center gap-1 text-sm bg-red-600 px-3 py-1 rounded"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
