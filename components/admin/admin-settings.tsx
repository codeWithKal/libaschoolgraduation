"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Calendar,
  Clock,
  School,
  Users,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface EventData {
  schoolName: string;
  batchName: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  countdownDate: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/event");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!settings) return;

    setSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
    setSaving(false);
  }

  function handleDateChange(dateString: string) {
    if (!settings) return;
    const [hours, minutes] = settings.time.split(":");
    const countdownDate = `${dateString}T${hours || "00"}:${minutes || "00"}:00`;
    setSettings({
      ...settings,
      date: dateString,
      countdownDate: countdownDate,
    });
  }

  function handleTimeChange(timeString: string) {
    if (!settings) return;
    const countdownDate = `${settings.date}T${timeString}:00`;
    setSettings({
      ...settings,
      time: timeString,
      countdownDate: countdownDate,
    });
  }

  function formatDisplayDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-netflix-red border-t-transparent rounded-full mb-4"
        />
        <p className="text-gray-400 animate-pulse">Loading settings...</p>
      </div>
    );
  }

  // Error State
  if (!settings) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Failed to Load
        </h3>
        <p className="text-gray-400 mb-4">Unable to fetch event settings</p>
        <button
          onClick={fetchSettings}
          className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header Section */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-netflix-red to-red-600 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Event Settings
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Configure graduation ceremony details
                </p>
              </div>
            </div>
          </div>

          {/* Save Button with Status */}
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {saveStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-xl"
                >
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-medium">Saved!</span>
                </motion.div>
              )}
              {saveStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-xl"
                >
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">Save failed</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg shadow-netflix-red/25"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </div>

        {/* Settings Last Updated */}
        <p className="text-gray-500 text-xs mt-3">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-800 rounded-3xl overflow-hidden">
        {/* Form Header */}
        <div className="px-8 py-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <School size={18} className="text-netflix-red" />
            <h3 className="text-lg font-semibold text-white">
              Event Information
            </h3>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* School Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <School size={16} className="text-netflix-red" />
                School Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) =>
                    setSettings({ ...settings, schoolName: e.target.value })
                  }
                  className="w-full bg-zinc-900 text-white p-4 rounded-2xl border-2 border-zinc-800 focus:border-netflix-red focus:outline-none transition-all duration-300 group-hover:border-zinc-700 pl-12"
                  placeholder="Enter school name"
                />
                <School
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            {/* Batch Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Users size={16} className="text-netflix-red" />
                Batch Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={settings.batchName}
                  onChange={(e) =>
                    setSettings({ ...settings, batchName: e.target.value })
                  }
                  className="w-full bg-zinc-900 text-white p-4 rounded-2xl border-2 border-zinc-800 focus:border-netflix-red focus:outline-none transition-all duration-300 group-hover:border-zinc-700 pl-12"
                  placeholder="Enter batch name"
                />
                <Users
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            {/* Event Title */}
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Sparkles size={16} className="text-netflix-red" />
                Event Title
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) =>
                    setSettings({ ...settings, title: e.target.value })
                  }
                  className="w-full bg-zinc-900 text-white p-4 rounded-2xl border-2 border-zinc-800 focus:border-netflix-red focus:outline-none transition-all duration-300 group-hover:border-zinc-700 pl-12"
                  placeholder="Enter event title"
                />
                <Sparkles
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Calendar size={16} className="text-netflix-red" />
                Event Date
              </label>
              <div className="relative group">
                <input
                  type="date"
                  value={settings.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full bg-zinc-900 text-white p-4 rounded-2xl border-2 border-zinc-800 focus:border-netflix-red focus:outline-none transition-all duration-300 group-hover:border-zinc-700 [color-scheme:dark] cursor-pointer"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              {settings.date && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-400 text-sm flex items-center gap-1.5"
                >
                  <ChevronRight size={12} className="text-netflix-red" />
                  {formatDisplayDate(settings.date)}
                </motion.p>
              )}
            </div>

            {/* Time Picker */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Clock size={16} className="text-netflix-red" />
                Event Time
              </label>
              <div className="relative group">
                <input
                  type="time"
                  value={settings.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full bg-zinc-900 text-white p-4 rounded-2xl border-2 border-zinc-800 focus:border-netflix-red focus:outline-none transition-all duration-300 group-hover:border-zinc-700 [color-scheme:dark] cursor-pointer"
                />
              </div>
              {settings.time && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-400 text-sm flex items-center gap-1.5"
                >
                  <ChevronRight size={12} className="text-netflix-red" />
                  {settings.time}
                </motion.p>
              )}
            </div>

            {/* Venue */}
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <MapPin size={16} className="text-netflix-red" />
                Venue
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={settings.venue}
                  onChange={(e) =>
                    setSettings({ ...settings, venue: e.target.value })
                  }
                  className="w-full bg-zinc-900 text-white p-4 rounded-2xl border-2 border-zinc-800 focus:border-netflix-red focus:outline-none transition-all duration-300 group-hover:border-zinc-700 pl-12"
                  placeholder="Enter venue"
                />
                <MapPin
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            {/* Countdown Date (Auto-generated) */}
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Clock size={16} className="text-netflix-red" />
                Countdown Target
                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full font-normal">
                  Auto-generated
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.countdownDate}
                  readOnly
                  className="w-full bg-zinc-900/50 text-gray-500 p-4 rounded-2xl border-2 border-zinc-800 cursor-not-allowed pl-12 font-mono text-sm"
                />
                <Clock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full font-medium">
                    Auto
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-xs flex items-center gap-1.5">
                <AlertCircle size={12} />
                Automatically synced with Event Date & Time fields
              </p>
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="px-8 py-4 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
          <p className="text-gray-500 text-xs">
            All changes are automatically reflected on the live site
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Settings loaded
          </div>
        </div>
      </div>
    </motion.div>
  );
}
