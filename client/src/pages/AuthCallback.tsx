import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        window.location.href = "/";
        return;
      }

      if (data.session) {
        window.location.href = "/";
      } else {
        window.location.href = "/";
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B4B8A] mx-auto"></div>
        <p className="mt-4 text-slate-600">ログイン処理中...</p>
      </div>
    </div>
  );
}
