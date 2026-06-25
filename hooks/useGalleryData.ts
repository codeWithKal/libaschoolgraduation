// hooks/useGalleryData.ts
import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface GalleryItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  studentId: number;
  day: string;
  approved: boolean;
  created_at?: string;
}

export function useGalleryData(initialApproved: boolean = true) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Please check environment variables.",
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("approved", initialApproved)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const items = data.map((item) => ({
        id: item.id,
        type: item.type,
        url: item.url,
        caption: item.caption,
        studentId: item.student_id,
        day: item.day || "Welcome Day",
        approved: item.approved,
        created_at: item.created_at,
      }));

      setGallery(items);
    } catch (err) {
      console.error("Error fetching gallery:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch gallery");
    } finally {
      setLoading(false);
    }
  }, [initialApproved]);

  // Real-time subscription for gallery updates
  useEffect(() => {
    fetchGallery();

    // Only subscribe if Supabase is configured
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel("gallery-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gallery",
        },
        (payload) => {
          fetchGallery();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGallery]);

  return { gallery, loading, error, refresh: fetchGallery };
}
