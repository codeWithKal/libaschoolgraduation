"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (password === "admin123") {
        localStorage.setItem("admin_logged_in", "true");
        router.push("/admin");
      } else {
        setError("Incorrect password. Try again.");
        setLoading(false);
      }
    }, 800);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            Admin <span className="text-red-500">Access</span>
          </h1>
          <p className="text-gray-400 mt-2">Secure dashboard authentication</p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl"
        >
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                <Lock size={14} />
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            {/* Button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition"
            >
              <LogIn size={18} />
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Authorized access only
        </p>
      </motion.div>
    </main>
  );
}
