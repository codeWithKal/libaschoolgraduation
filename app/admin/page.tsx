"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LogOut,
  Image as ImageIcon,
  MessageSquare,
  LayoutDashboard,
} from "lucide-react";
import { useRouter } from "next/navigation";

import AdminSharedGallery from "@/components/admin/admin-shared-gallery";
import AdminGuestbook from "@/components/admin/admin-guestbook";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";

type Tab = "overview" | "shared-gallery" | "guestbook";

type Stats = {
  sharedGallery: number;
  guestbook: number;
  pendingGallery: number;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats>({
    sharedGallery: 0,
    guestbook: 0,
    pendingGallery: 0,
  });
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    try {
      // Fetch gallery stats from Supabase
      const { data: galleryData, error: galleryError } = await supabase
        .from("gallery")
        .select("approved", { count: "exact" });

      if (galleryError) throw galleryError;

      const totalGallery = galleryData?.length || 0;
      const pendingGallery =
        galleryData?.filter((item) => !item.approved).length || 0;

      // Fetch guestbook stats from Supabase
      const { count: guestbookCount, error: guestbookError } = await supabase
        .from("guestbook")
        .select("*", { count: "exact", head: true });

      if (guestbookError) throw guestbookError;

      setStats({
        sharedGallery: totalGallery,
        guestbook: guestbookCount || 0,
        pendingGallery: pendingGallery,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
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
    { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
    { id: "shared-gallery" as Tab, label: "Gallery", icon: ImageIcon },
    { id: "guestbook" as Tab, label: "Guestbook", icon: MessageSquare },
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
              Manage gallery & guestbook content
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
            className="space-y-6"
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse"
                  >
                    <div className="h-4 bg-white/10 rounded w-20 mb-2" />
                    <div className="h-10 bg-white/10 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  label="Total Gallery Items"
                  value={stats.sharedGallery.toString()}
                  subtext={`${stats.pendingGallery} pending approval`}
                />
                <StatCard
                  label="Guestbook Entries"
                  value={stats.guestbook.toString()}
                />
                <StatCard
                  label="Pending Approval"
                  value={stats.pendingGallery.toString()}
                  subtext="Awaiting your review"
                  highlight
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <QuickActionCard
                title="Manage Gallery"
                description="Approve, edit, or delete uploaded memories"
                icon={ImageIcon}
                onClick={() => setActiveTab("shared-gallery")}
                color="from-purple-500 to-pink-500"
              />
              <QuickActionCard
                title="Manage Guestbook"
                description="View and manage guestbook messages"
                icon={MessageSquare}
                onClick={() => setActiveTab("guestbook")}
                color="from-blue-500 to-cyan-500"
              />
            </div>
          </motion.div>
        )}

        {activeTab === "shared-gallery" && <AdminSharedGallery />}
        {activeTab === "guestbook" && <AdminGuestbook />}
      </div>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}

/* STATS CARD */
function StatCard({
  label,
  value,
  subtext,
  highlight = false,
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`bg-white/5 border rounded-2xl p-6 backdrop-blur-md transition-all ${
        highlight
          ? "border-yellow-500/30 hover:border-yellow-500/50"
          : "border-white/10 hover:border-red-500/30"
      }`}
    >
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p
        className={`text-4xl font-bold ${
          highlight ? "text-yellow-400" : "text-red-500"
        }`}
      >
        {value}
      </p>
      {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
    </motion.div>
  );
}

/* QUICK ACTION CARD */
function QuickActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  color,
}: {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`bg-gradient-to-r ${color} p-0.5 rounded-2xl cursor-pointer`}
    >
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 h-full transition-all hover:bg-black/70">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${color}/20`}>
            <Icon className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
            <div className="mt-3 text-sm text-white/60 flex items-center gap-1">
              Click to manage →
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
