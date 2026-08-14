import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error) {
      toast.error("ログインに失敗しました");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("ログアウトしました");
    } catch (error) {
      toast.error("ログアウトに失敗しました");
      console.error(error);
    }
  };

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="items-center gap-2 border-slate-300 hover:bg-slate-50 transition-colors"
      >
        <UserIcon className="h-4 w-4" />
        <span className="hidden md:inline">{user.email}</span>
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      size="sm"
      className="items-center gap-2 border-slate-300 hover:bg-slate-50 transition-colors"
    >
      <UserIcon className="h-4 w-4" />
      Googleでログイン
    </Button>
  );
}
