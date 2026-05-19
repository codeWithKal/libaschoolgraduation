"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  Edit2,
  Plus,
  Upload,
  X,
  BookOpen,
  Loader2,
} from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  subject: string;
  photo_url?: string;
  bio?: string;
  quote?: string;
}

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    bio: "",
    quote: "",
    photo_url: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  //
  // FETCH TEACHERS FROM JSON
  //
  async function fetchTeachers() {
    try {
      setLoading(true);
      const response = await fetch("/api/data/teachers.json");
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }

  //
  // IMAGE UPLOAD
  //
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  }

  //
  // UPLOAD IMAGE TO SERVER
  //
  async function uploadImageToServer(
    file: File,
    teacherId: number,
    teacherName: string,
  ): Promise<string> {
    const formData = new FormData();

    // Generate filename: teacher-name-teacherId.extension
    const extension = file.name.split(".").pop() || "jpg";
    const sanitizedName = teacherName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const filename = `teacher${teacherId}.${extension}`;

    const renamedFile = new File([file], filename, { type: file.type });
    formData.append("image", renamedFile);
    formData.append("teacherId", teacherId.toString());

    const response = await fetch("/api/upload/teacher-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload image");
    }

    const data = await response.json();
    return data.imagePath; // Returns path like "/images/teachers/teacher1.jpg"
  }

  //
  // DELETE OLD IMAGE
  //
  async function deleteOldImage(imagePath: string) {
    if (
      !imagePath ||
      imagePath.startsWith("data:") ||
      imagePath.startsWith("https://")
    ) {
      return; // Skip base64 and external URLs
    }

    try {
      await fetch("/api/upload/teacher-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imagePath }),
      });
    } catch (error) {
      console.error("Error deleting old image:", error);
    }
  }

  //
  // SAVE TEACHERS TO JSON (via API)
  //
  async function saveTeachers(updatedTeachers: Teacher[]) {
    try {
      const response = await fetch("/api/teachers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teachers: updatedTeachers }),
      });

      if (!response.ok) {
        throw new Error("Failed to save teachers");
      }

      await fetchTeachers();
    } catch (error) {
      console.error("Error saving teachers:", error);
      throw error;
    }
  }

  //
  // CREATE OR UPDATE TEACHER
  //
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a teacher name");
      return;
    }

    if (!formData.subject.trim()) {
      alert("Please enter a subject");
      return;
    }

    setUploading(true);

    try {
      let photoPath = editingTeacher?.photo_url || "";

      // If there's a new image file, upload it first
      if (imageFile) {
        const teacherId = editingTeacher?.id || Date.now();

        // Upload new image to server
        photoPath = await uploadImageToServer(
          imageFile,
          teacherId,
          formData.name,
        );

        // Delete old image if editing and photo changed
        if (
          editingTeacher?.photo_url &&
          editingTeacher.photo_url !== photoPath &&
          !editingTeacher.photo_url.startsWith("https://") &&
          !editingTeacher.photo_url.startsWith("data:")
        ) {
          await deleteOldImage(editingTeacher.photo_url);
        }
      }

      let updatedTeachers: Teacher[];

      if (editingTeacher) {
        // Update existing teacher
        updatedTeachers = teachers.map((t) =>
          t.id === editingTeacher.id
            ? {
                ...t,
                name: formData.name,
                subject: formData.subject,
                bio: formData.bio,
                quote: formData.quote,
                photo_url: photoPath || formData.photo_url,
              }
            : t,
        );
      } else {
        // Create new teacher
        const newId = Math.max(...teachers.map((t) => t.id), 0) + 1;
        const newTeacher: Teacher = {
          id: newId,
          name: formData.name,
          subject: formData.subject,
          photo_url: photoPath || "",
          bio: formData.bio,
          quote: formData.quote,
        };
        updatedTeachers = [...teachers, newTeacher];
      }

      await saveTeachers(updatedTeachers);
      resetForm();
    } catch (error) {
      console.error("Submit Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save teacher. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  //
  // DELETE TEACHER
  //
  async function handleDelete(id: number) {
    const confirmed = confirm("Are you sure you want to delete this teacher?");
    if (!confirmed) return;

    try {
      const teacher = teachers.find((t) => t.id === id);

      // Delete associated image
      if (
        teacher?.photo_url &&
        !teacher.photo_url.startsWith("https://") &&
        !teacher.photo_url.startsWith("data:")
      ) {
        await deleteOldImage(teacher.photo_url);
      }

      // Remove teacher from array
      const updatedTeachers = teachers.filter((t) => t.id !== id);
      await saveTeachers(updatedTeachers);
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete teacher. Please try again.");
    }
  }

  //
  // START EDITING
  //
  function startEdit(teacher: Teacher) {
    setEditingTeacher({ ...teacher });
    setFormData({
      name: teacher.name,
      subject: teacher.subject,
      bio: teacher.bio || "",
      quote: teacher.quote || "",
      photo_url: teacher.photo_url || "",
    });
    setImagePreview(teacher.photo_url || "");
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  //
  // RESET FORM
  //
  function resetForm() {
    setEditingTeacher(null);
    setShowForm(false);
    setImagePreview("");
    setImageFile(null);
    setFormData({
      name: "",
      subject: "",
      bio: "",
      quote: "",
      photo_url: "",
    });
  }

  //
  // GET IMAGE SOURCE (handle different formats)
  //
  function getImageSrc(teacher: Teacher): string {
    if (teacher.photo_url && teacher.photo_url.startsWith("images/")) {
      return "/" + teacher.photo_url;
    }
    return teacher.photo_url || "";
  }

  //
  // LOADING STATE
  //
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-lg flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          Loading teachers...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="text-red-500" />
            Teacher Management
          </h1>
          <p className="text-gray-400 mt-1">Manage faculty profiles</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-red-600 hover:bg-red-700 transition px-5 py-3 rounded-xl flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Add Teacher
        </button>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl"
          >
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingTeacher ? "Edit Teacher" : "Create Teacher"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {editingTeacher
                    ? "Update teacher profile information"
                    : "Add a new teacher to the directory"}
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
              {/* NAME & SUBJECT */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter teacher name"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl text-white"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Subject *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Biology, Mathematics"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl text-white"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* PHOTO UPLOAD */}
              <div className="space-y-4">
                <label className="text-sm text-gray-400">
                  Teacher Photo {!editingTeacher && "(Optional)"}
                </label>

                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-700 hover:border-red-500 transition bg-zinc-900 rounded-3xl p-8 cursor-pointer">
                  <Upload size={28} className="text-gray-400" />
                  <div className="text-center">
                    <p className="text-gray-200 font-medium">
                      {imagePreview ? "Change photo" : "Upload teacher image"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG or WEBP (max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={handleImageUpload}
                  />
                </label>

                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center"
                  >
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-52 h-52 object-cover rounded-3xl border border-zinc-700 shadow-xl"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                          setFormData((prev) => ({ ...prev, photo_url: "" }));
                        }}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 rounded-full p-2 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* BIOGRAPHY */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Biography</label>
                <textarea
                  rows={4}
                  placeholder="Write a short biography about the teacher..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl resize-none text-white"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>

              {/* QUOTE */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Inspirational Quote
                </label>
                <textarea
                  rows={3}
                  placeholder="Add an inspirational quote from the teacher..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl resize-none text-white"
                  value={formData.quote}
                  onChange={(e) =>
                    setFormData({ ...formData, quote: e.target.value })
                  }
                />
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Uploading...
                    </>
                  ) : editingTeacher ? (
                    "Update Teacher"
                  ) : (
                    "Create Teacher"
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={uploading}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 transition py-4 rounded-2xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* TEACHERS GRID */}
      {teachers.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No teachers found.</p>
          <p className="text-sm mt-2">Click "Add Teacher" to create one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              {/* IMAGE */}
              <div className="relative h-60 overflow-hidden bg-black">
                {getImageSrc(teacher) ? (
                  <img
                    src={getImageSrc(teacher)}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <BookOpen size={48} />
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-xs px-3 py-1 rounded-full">
                  {teacher.subject}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">{teacher.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {teacher.bio || "No biography added."}
                  </p>
                </div>

                {/* QUOTE */}
                {teacher.quote && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Quote</p>
                    <p className="text-sm text-gray-300 line-clamp-3 italic">
                      &ldquo;{teacher.quote}&rdquo;
                    </p>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => startEdit(teacher)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition p-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(teacher.id)}
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
