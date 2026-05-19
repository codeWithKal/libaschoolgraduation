"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle,
  XCircle,
  X,
  Plus,
  Minus,
  ImageDown,
  Video,
  Loader2,
} from "lucide-react";

interface NotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

function Notification({ message, type, onClose }: NotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 50, y: -20 }}
      className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
        type === "success"
          ? "bg-green-500/95 backdrop-blur-sm border border-green-400"
          : "bg-red-500/95 backdrop-blur-sm border border-red-400"
      } text-white max-w-md`}
    >
      {type === "success" ? (
        <CheckCircle size={20} className="flex-shrink-0" />
      ) : (
        <XCircle size={20} className="flex-shrink-0" />
      )}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export default function UploadMemory({
  onUploaded,
}: {
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: string;
    compressedSize: string;
    savings: string;
    method: string;
  } | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    const wasSubmitted = localStorage.getItem("uploadSubmitted");
    if (wasSubmitted === "true") {
      setIsSubmitted(true);
      setIsExpanded(false);
    }
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (selectedFile.size > maxSize) {
      showNotification(
        `File too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 100MB.`,
        "error",
      );
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressionInfo(null);
  };

  async function handleUpload() {
    if (!file) {
      showNotification("Please select a file to upload", "error");
      return;
    }

    if (!caption.trim()) {
      showNotification("Please enter a caption", "error");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const form = new FormData();
    form.append("file", file);
    form.append("caption", caption);
    form.append("studentId", "1");

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        body: form,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Display compression info if available
      if (result.compressionInfo) {
        setCompressionInfo(result.compressionInfo);
        showNotification(
          `✓ ${result.message || "Upload successful!"}`,
          "success",
        );
      } else {
        showNotification(
          "✓ Upload successful! Waiting for admin approval...",
          "success",
        );
      }

      setIsSubmitted(true);
      setIsExpanded(false);
      localStorage.setItem("uploadSubmitted", "true");

      // Reset form
      setFile(null);
      setCaption("");
      setOriginalSize(null);

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      onUploaded();
    } catch (err) {
      console.error("Upload failed", err);
      showNotification(
        err instanceof Error
          ? err.message
          : "Failed to upload memory. Please try again.",
        "error",
      );
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setUploadProgress(0);
      }, 1000);
    }
  }

  const handleNewUpload = () => {
    setIsSubmitted(false);
    setIsExpanded(true);
    localStorage.removeItem("uploadSubmitted");
    setFile(null);
    setCaption("");
    setOriginalSize(null);
    setCompressionInfo(null);
    setUploadProgress(0);
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const toggleExpand = () => {
    if (!isSubmitted) {
      setIsExpanded(!isExpanded);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <>
      <AnimatePresence>
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() =>
              setNotification({ show: false, message: "", type: "success" })
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden"
          >
            <button
              onClick={toggleExpand}
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
              <h2 className="text-white font-bold text-xl">Upload Memory</h2>
              <div className="text-gray-400">
                {isExpanded ? <Minus size={20} /> : <Plus size={20} />}
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 px-6 pb-6"
                >
                  <div>
                    <label className="flex items-center gap-3 p-4 border border-white/10 rounded-xl cursor-pointer hover:border-yellow-500/50 transition-colors">
                      <Upload className="text-gray-400" />
                      <span className="text-gray-300">
                        {file ? file.name : "Choose image/video"}
                      </span>
                      <input
                        type="file"
                        hidden
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                      />
                    </label>

                    {/* Show original file size */}
                    {originalSize && !compressionInfo && (
                      <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                        {file?.type.startsWith("image/") ? (
                          <ImageDown size={12} />
                        ) : (
                          <Video size={12} />
                        )}
                        <span>
                          Original size: {formatFileSize(originalSize)}
                        </span>
                      </div>
                    )}

                    {/* Show compression info from server */}
                    {compressionInfo && (
                      <div className="mt-2 text-xs text-green-400 flex items-center gap-2 bg-green-400/10 p-2 rounded-lg">
                        {file?.type.startsWith("image/") ? (
                          <ImageDown size={12} />
                        ) : (
                          <Video size={12} />
                        )}
                        <div>
                          <span className="font-medium">
                            Server Compression Applied!
                          </span>
                          <div className="text-green-300">
                            {compressionInfo.originalSize} →{" "}
                            {compressionInfo.compressedSize}(
                            {compressionInfo.savings} saved)
                          </div>
                          <div className="text-yellow-300 text-xs">
                            Method: {compressionInfo.method}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upload Progress */}
                    {loading && uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Uploading to server...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Caption..."
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-500 focus:border-yellow-500 focus:outline-none transition-colors"
                  />

                  <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Uploading... {uploadProgress}%
                      </div>
                    ) : (
                      "Upload (Server Optimized)"
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-green-500/10 border border-green-500/30 backdrop-blur-xl rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="text-green-400" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Upload Successful!</h3>
                  <p className="text-sm text-green-400">
                    Your memory is pending admin approval
                  </p>
                  {compressionInfo && (
                    <p className="text-xs text-green-300 mt-1">
                      {compressionInfo.savings} space saved via server
                      compression
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleNewUpload}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
              >
                Upload Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
