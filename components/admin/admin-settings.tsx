"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";

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
    try {
      const response = await fetch("/api/event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-white">Loading settings...</div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-white">
        Failed to load settings
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Event Settings</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="bg-netflix-red hover:bg-netflix-darkred text-white px-6 py-2 rounded flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      </div>

      <div className="bg-netflix-black border border-netflix-gray/30 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-netflix-red text-sm font-semibold mb-2">
              School Name
            </label>
            <input
              type="text"
              value={settings.schoolName}
              onChange={(e) =>
                setSettings({ ...settings, schoolName: e.target.value })
              }
              className="w-full bg-netflix-gray text-white p-3 rounded border border-netflix-gray/30"
            />
          </div>
          <div>
            <label className="block text-netflix-red text-sm font-semibold mb-2">
              Batch Name
            </label>
            <input
              type="text"
              value={settings.batchName}
              onChange={(e) =>
                setSettings({ ...settings, batchName: e.target.value })
              }
              className="w-full bg-netflix-gray text-white p-3 rounded border border-netflix-gray/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-netflix-red text-sm font-semibold mb-2">
              Event Title
            </label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) =>
                setSettings({ ...settings, title: e.target.value })
              }
              className="w-full bg-netflix-gray text-white p-3 rounded border border-netflix-gray/30"
            />
          </div>
          <div>
            <label className="block text-netflix-red text-sm font-semibold mb-2">
              Date
            </label>
            <input
              type="text"
              value={settings.date}
              onChange={(e) =>
                setSettings({ ...settings, date: e.target.value })
              }
              className="w-full bg-netflix-gray text-white p-3 rounded border border-netflix-gray/30"
            />
          </div>
          <div>
            <label className="block text-netflix-red text-sm font-semibold mb-2">
              Time
            </label>
            <input
              type="text"
              value={settings.time}
              onChange={(e) =>
                setSettings({ ...settings, time: e.target.value })
              }
              className="w-full bg-netflix-gray text-white p-3 rounded border border-netflix-gray/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-netflix-red text-sm font-semibold mb-2">
              Venue
            </label>
            <input
              type="text"
              value={settings.venue}
              onChange={(e) =>
                setSettings({ ...settings, venue: e.target.value })
              }
              className="w-full bg-netflix-gray text-white p-3 rounded border border-netflix-gray/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-netflix-red text-sm font-semibold mb-2">
              Countdown Date (ISO format)
            </label>
            <input
              type="text"
              value={settings.countdownDate}
              onChange={(e) =>
                setSettings({ ...settings, countdownDate: e.target.value })
              }
              className="w-full bg-netflix-gray text-white p-3 rounded border border-netflix-gray/30"
              placeholder="2024-06-15T18:00:00.000Z"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
