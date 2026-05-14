"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit2, Plus, Upload, X, GraduationCap } from "lucide-react";

interface Student {
  id: string;
  name: string;
  department: "Natural" | "Social";
  photo?: string;
  bio?: string;
  lastWord?: string;
  messages?: string[];
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    department: "Natural" as "Natural" | "Social",
    bio: "",
    lastWord: "",
    photo: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  //
  // FETCH STUDENTS
  //
  async function fetchStudents() {
    try {
      setLoading(true);

      const response = await fetch("/api/students");

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();

      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  //
  // IMAGE UPLOAD
  //
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      setFormData((prev) => ({
        ...prev,
        photo: base64,
      }));

      setImagePreview(base64);
    };

    reader.readAsDataURL(file);
  }

  //
  // CREATE OR UPDATE
  //
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const method = editingStudent ? "PUT" : "POST";

      const payload = editingStudent
        ? {
            ...editingStudent,
            ...formData,
          }
        : formData;

      const response = await fetch("/api/students", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save student");
      }

      await fetchStudents();

      resetForm();
    } catch (error) {
      console.error("Submit Error:", error);
    }
  }

  //
  // DELETE
  //
  async function handleDelete(id: string) {
    const confirmed = confirm("Are you sure you want to delete this student?");

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/students?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      // instant UI update
      setStudents((prev) => prev.filter((student) => student.id !== id));

      await fetchStudents();
    } catch (error) {
      console.error("Delete Error:", error);
    }
  }

  //
  // START EDIT
  //
  function startEdit(student: Student) {
    const cloned = { ...student };

    setEditingStudent(cloned);

    setFormData({
      name: cloned.name,
      department: cloned.department,
      bio: cloned.bio || "",
      lastWord: cloned.lastWord || "",
      photo: cloned.photo || "",
    });

    setImagePreview(cloned.photo || "");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  //
  // RESET FORM
  //
  function resetForm() {
    setEditingStudent(null);

    setShowForm(false);

    setImagePreview("");

    setFormData({
      name: "",
      department: "Natural",
      bio: "",
      lastWord: "",
      photo: "",
    });
  }

  //
  // LOADING
  //
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-lg">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="text-red-500" />
            Student Management
          </h1>

          <p className="text-gray-400 mt-1">
            Manage graduate profiles and memories
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-red-600 hover:bg-red-700 transition px-5 py-3 rounded-xl flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      {/* FORM */}
      {/* MODAL */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
          {/* MODAL CARD */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl"
          >
            {/* HEADER */}
            <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingStudent ? "Edit Student" : "Create Student"}
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Manage student profile information
                </p>
              </div>

              <button
                onClick={resetForm}
                className="bg-zinc-800 hover:bg-zinc-700 transition p-3 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* GRID */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* NAME */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Full Name</label>

                  <input
                    required
                    type="text"
                    placeholder="Enter full name"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* DEPARTMENT */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Department</label>

                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: e.target.value as "Natural" | "Social",
                      })
                    }
                  >
                    <option value="Natural">Natural Science</option>

                    <option value="Social">Social Science</option>
                  </select>
                </div>
              </div>

              {/* PHOTO */}
              <div className="space-y-4">
                <label className="text-sm text-gray-400">Student Photo</label>

                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-700 hover:border-red-500 transition bg-zinc-900 rounded-3xl p-8 cursor-pointer">
                  <Upload size={28} />

                  <div className="text-center">
                    <p className="text-gray-200 font-medium">
                      Upload student image
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG or WEBP
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </label>

                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-52 h-52 object-cover rounded-3xl border border-zinc-700 shadow-xl"
                    />
                  </motion.div>
                )}
              </div>

              {/* BIO */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Biography</label>

                <textarea
                  rows={5}
                  placeholder="Student biography..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl resize-none"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bio: e.target.value,
                    })
                  }
                />
              </div>

              {/* LAST WORD */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Last Word</label>

                <textarea
                  rows={4}
                  placeholder="Student final message..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl resize-none"
                  value={formData.lastWord}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastWord: e.target.value,
                    })
                  }
                />
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 transition py-4 rounded-2xl font-semibold text-lg"
                >
                  {editingStudent ? "Update Student" : "Create Student"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition py-4 rounded-2xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* STUDENTS GRID */}
      {students.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          No students found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              {/* IMAGE */}
              <div className="relative h-60 overflow-hidden bg-black">
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    No Image
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-xs px-3 py-1 rounded-full">
                  {student.department}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">{student.name}</h3>

                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {student.bio || "No biography added."}
                  </p>
                </div>

                {/* LAST WORD */}
                {student.lastWord && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Last Word</p>

                    <p className="text-sm text-gray-300 line-clamp-3 italic">
                      "{student.lastWord}"
                    </p>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => startEdit(student)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition p-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(student.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 transition p-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
