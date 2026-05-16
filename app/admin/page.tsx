"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LogOut,
  Users,
  Image as ImageIcon,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

import AdminStudents from "@/components/admin/admin-students";
import AdminTeachers from "@/components/admin/admin-teachers";
import AdminMemories from "@/components/admin/admin-memories";
import AdminSharedGallery from "@/components/admin/admin-shared-gallery";
import AdminGuestbook from "@/components/admin/admin-guestbook";
import AdminSettings from "@/components/admin/admin-settings";
import Footer from "@/components/footer";

type Tab =
  | "overview"
  | "students"
  | "teachers"
  | "memories"
  | "shared-gallery"
  | "guestbook"
  | "settings";

type Stats = {
  students: number;
  teachers: number;
  memories: number;
  sharedGallery: number;
  guestbook: number;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [stats, setStats] = useState<Stats>({
    students: 0,
    teachers: 0,
    memories: 0,
    sharedGallery: 0,
    guestbook: 0,
  });

  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in") === "true";

    if (!loggedIn) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      loadStats();
    }
  }, [router]);

  const loadStats = async () => {
    try {
      const [
        studentsRes,
        teachersRes,
        gabiRes,
        tripRes,
        crazyRes,
        sharedGalleryRes,
        guestbookRes,
      ] = await Promise.all([
        fetch("/data/students.json"),
        fetch("/data/teachers.json"),
        fetch("/data/gabi_day.json"),
        fetch("/data/welcome_day.json"),
        fetch("/data/crazy_day.json"),
        fetch("/data/gallery.json"),
        fetch("/data/guestbook.json"),
      ]);

      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();
      const gabiData = await gabiRes.json();
      const tripData = await tripRes.json();
      const crazyData = await crazyRes.json();
      const sharedGalleryData = await sharedGalleryRes.json();
      const guestbookData = await guestbookRes.json();

      const memoriesTotal =
        (Array.isArray(gabiData) ? gabiData.length : 0) +
        (Array.isArray(tripData) ? tripData.length : 0) +
        (Array.isArray(crazyData) ? crazyData.length : 0);

      setStats({
        students: Array.isArray(studentsData) ? studentsData.length : 0,
        teachers: Array.isArray(teachersData) ? teachersData.length : 0,
        memories: memoriesTotal,
        sharedGallery: Array.isArray(sharedGalleryData)
          ? sharedGalleryData.length
          : 0,
        guestbook: Array.isArray(guestbookData) ? guestbookData.length : 0,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-netflix-red text-lg animate-pulse">
          Checking authentication...
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: Users },
    { id: "students" as Tab, label: "Students", icon: Users },
    { id: "teachers" as Tab, label: "Teachers", icon: Users },
    { id: "memories" as Tab, label: "Memories", icon: ImageIcon },
    { id: "shared-gallery" as Tab, label: "Gallery", icon: ImageIcon },
    { id: "guestbook" as Tab, label: "Guestbook", icon: MessageSquare },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white flex flex-col">
      {/* HEADER */}
      <div className="border-b border-red-900/30 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin <span className="text-red-500">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Manage graduation content & memories
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 px-5 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <LogOut size={18} />
            Logout
          </motion.button>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-[88px] z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full shrink-0 transition-all text-sm font-medium ${
                    activeTab === tab.id
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            <StatCard label="Students" value={stats.students.toString()} />
            <StatCard label="Teachers" value={stats.teachers.toString()} />
            <StatCard label="Memories" value={stats.memories.toString()} />
            <StatCard label="Gallery" value={stats.sharedGallery.toString()} />
            <StatCard label="Guestbook" value={stats.guestbook.toString()} />
          </motion.div>
        )}

        {activeTab === "students" && <AdminStudents />}
        {activeTab === "teachers" && <AdminTeachers />}
        {activeTab === "memories" && <AdminMemories />}
        {activeTab === "shared-gallery" && <AdminSharedGallery />}
        {activeTab === "guestbook" && <AdminGuestbook />}
        {activeTab === "settings" && <AdminSettings />}
      </div>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}

/* STATS CARD */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-red-500/30 transition-all"
    >
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className="text-4xl font-bold text-red-500">{value}</p>
    </motion.div>
  );
}
