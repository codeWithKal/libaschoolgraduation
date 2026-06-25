// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Only create client if we have both URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Check if we have valid environment variables
const hasValidConfig = !!(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl !== "https://placeholder.supabase.co" &&
  supabasePublishableKey !== "placeholder-key"
);

// Create client with validation
let supabaseClient: any = null;

if (hasValidConfig) {
  supabaseClient = createClient(supabaseUrl, supabasePublishableKey);
  console.log("✅ Supabase client initialized successfully");
} else {
  console.warn(
    "⚠️ Supabase client not initialized - missing environment variables",
  );
  // Create a mock client that throws helpful errors when used
  supabaseClient = {
    from: () => {
      throw new Error(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      );
    },
    auth: {
      getSession: () => {
        throw new Error(
          "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        );
      },
      onAuthStateChange: () => {
        throw new Error(
          "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        );
      },
    },
    storage: {
      from: () => {
        throw new Error(
          "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        );
      },
    },
    channel: () => {
      throw new Error(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      );
    },
    removeChannel: () => {},
  };
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = hasValidConfig;
