"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export default function UploadMemory({
  onUploaded,
}: {
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file || !caption) return;

    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("caption", caption);
    form.append("studentId", "1");

    try {
      await fetch("/api/gallery", {
        method: "POST",
        body: form,
      });

      setFile(null);
      setCaption("");

      onUploaded();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
      <h2 className="text-white font-bold text-xl">Upload Memory</h2>

      {/* FILE */}
      <label className="flex items-center gap-3 p-4 border border-white/10 rounded-xl cursor-pointer">
        <Upload className="text-gray-400" />
        <span className="text-gray-300">
          {file ? file.name : "Choose image/video"}
        </span>
        <input
          type="file"
          hidden
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      {/* CAPTION */}
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption..."
        className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
      />

      {/* STATUS INFO */}
      <p className="text-xs text-yellow-400">
        ⚠ Uploaded media will be pending admin approval
      </p>

      {/* BUTTON */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
