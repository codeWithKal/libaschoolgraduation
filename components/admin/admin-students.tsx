"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  Edit2,
  Plus,
  Upload,
  X,
  GraduationCap,
  Loader2,
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  stream: "Natural" | "Social";
  photo?: string;
  bio?: string;
  last_word?: string;
  messages?: string[];
  stream?: string;
  photo_url?: string;
  last_word?: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    stream: "Natural" as "Natural" | "Social",
    bio: "",
    last_word: "",
    photo: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  //
  // FETCH STUDENTS FROM JSON
  //
  async function fetchStudents() {
    try {
      setLoading(true);
      const response = await fetch("/data/students.json");
      if (!response.ok) throw new Error("Failed to fetch students");
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
    studentId: number,
    studentName: string,
  ): Promise<string> {
    const formData = new FormData();

    // Generate filename: student-name-studentId.extension
    const extension = file.name.split(".").pop() || "jpg";
    const sanitizedName = studentName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const filename = `student${studentId}.${extension}`;

    const renamedFile = new File([file], filename, { type: file.type });
    formData.append("image", renamedFile);
    formData.append("studentId", studentId.toString());

    const response = await fetch("/api/upload/student-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload image");
    }

    const data = await response.json();
    return data.imagePath; // Returns path like "/images/students/student2.jpg"
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
      await fetch("/api/upload/student-image", {
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
  // SAVE STUDENTS TO JSON (via API)
  //
  async function saveStudents(updatedStudents: Student[]) {
    try {
      const response = await fetch("/api/students", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ students: updatedStudents }),
      });

      if (!response.ok) {
        throw new Error("Failed to save students");
      }

      await fetchStudents();
    } catch (error) {
      console.error("Error saving students:", error);
      throw error;
    }
  }

  //
  // CREATE OR UPDATE STUDENT
  //
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a student name");
      return;
    }

    setUploading(true);

    try {
      let photoPath = editingStudent?.photo || "";

      // If there's a new image file, upload it first
      if (imageFile) {
        const studentId = editingStudent?.id || Date.now();

        // Upload new image to server
        photoPath = await uploadImageToServer(
          imageFile,
          studentId,
          formData.name,
        );

        // Delete old image if editing and photo changed
        if (
          editingStudent?.photo &&
          editingStudent.photo !== photoPath &&
          !editingStudent.photo.startsWith("https://") &&
          !editingStudent.photo.startsWith("data:")
        ) {
          await deleteOldImage(editingStudent.photo);
        }
      }

      let updatedStudents: Student[];

      if (editingStudent) {
        // Update existing student
        updatedStudents = students.map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                name: formData.name,
                stream: formData.stream,
                bio: formData.bio,
                last_word: formData.last_word,
                photo: photoPath || formData.photo,
                last_word: formData.last_word, // Keep both fields in sync
              }
            : s,
        );
      } else {
        // Create new student
        const newId = Math.max(...students.map((s) => s.id), 0) + 1;
        const newStudent: Student = {
          id: newId,
          name: formData.name,
          stream: formData.stream,
          photo: photoPath || "",
          bio: formData.bio,
          last_word: formData.last_word,
          last_word: formData.last_word,
          messages: [],
        };
        updatedStudents = [...students, newStudent];
      }

      await saveStudents(updatedStudents);
      resetForm();
    } catch (error) {
      console.error("Submit Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save student. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  //
  // DELETE STUDENT
  //
  async function handleDelete(id: number) {
    const confirmed = confirm("Are you sure you want to delete this student?");
    if (!confirmed) return;

    try {
      const student = students.find((s) => s.id === id);

      // Delete associated image
      if (
        student?.photo &&
        !student.photo.startsWith("https://") &&
        !student.photo.startsWith("data:")
      ) {
        await deleteOldImage(student.photo);
      }

      // Remove student from array
      const updatedStudents = students.filter((s) => s.id !== id);
      await saveStudents(updatedStudents);
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete student. Please try again.");
    }
  }

  //
  // START EDITING
  //
  function startEdit(student: Student) {
    setEditingStudent({ ...student });
    setFormData({
      name: student.name,
      stream: student.stream,
      bio: student.bio || "",
      last_word: student.last_word || student.last_word || "",
      photo: student.photo || "",
    });
    setImagePreview(student.photo || "");
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  //
  // RESET FORM
  //
  function resetForm() {
    setEditingStudent(null);
    setShowForm(false);
    setImagePreview("");
    setImageFile(null);
    setFormData({
      name: "",
      stream: "Natural",
      bio: "",
      last_word: "",
      photo: "",
    });
  }

  //
  // GET IMAGE SOURCE (handle different formats)
  //
  function getImageSrc(student: Student): string {
    if (student.photo && student.photo.startsWith("images/")) {
      return "/" + student.photo;
    }
    return student.photo || student.photo_url || "";
  }

  //
  // LOADING STATE
  //
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-lg flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          Loading students...
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
                  {editingStudent ? "Edit Student" : "Create Student"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {editingStudent
                    ? "Update student profile information"
                    : "Add a new student to the directory"}
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
              {/* NAME & stream */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter full name"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl text-white"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">stream *</label>
                  <select
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl text-white"
                    value={formData.stream}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stream: e.target.value as "Natural" | "Social",
                      })
                    }
                  >
                    <option value="Natural">Natural Science</option>
                    <option value="Social">Social Science</option>
                  </select>
                </div>
              </div>

              {/* PHOTO UPLOAD */}
              <div className="space-y-4">
                <label className="text-sm text-gray-400">
                  Student Photo {!editingStudent && "(Optional)"}
                </label>

                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-700 hover:border-red-500 transition bg-zinc-900 rounded-3xl p-8 cursor-pointer">
                  <Upload size={28} className="text-gray-400" />
                  <div className="text-center">
                    <p className="text-gray-200 font-medium">
                      {imagePreview ? "Change photo" : "Upload student image"}
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
                          setFormData((prev) => ({ ...prev, photo: "" }));
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
                  rows={5}
                  placeholder="Write a short biography..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl resize-none text-white"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>

              {/* LAST WORD */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Last Word</label>
                <textarea
                  rows={4}
                  placeholder="Student's final message to the batch..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 outline-none p-4 rounded-2xl resize-none text-white"
                  value={formData.last_word}
                  onChange={(e) =>
                    setFormData({ ...formData, last_word: e.target.value })
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
                  ) : editingStudent ? (
                    "Update Student"
                  ) : (
                    "Create Student"
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

      {/* STUDENTS GRID */}
      {students.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No students found.</p>
          <p className="text-sm mt-2">Click "Add Student" to create one.</p>
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
                {getImageSrc(student) ? (
                  <img
                    src={getImageSrc(student)}
                    alt={student.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <GraduationCap size={48} />
                  </div>
                )}

                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-xs px-3 py-1 rounded-full capitalize">
                  {student.stream}
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
                {(student.last_word || student.last_word) && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Last Word</p>
                    <p className="text-sm text-gray-300 line-clamp-3 italic">
                      &ldquo;{student.last_word || student.last_word}&rdquo;
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
