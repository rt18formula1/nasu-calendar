import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("登録メールを送信しました");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("ログインしました");
        setShowModal(false);
      }
    } catch (error) {
      toast.error(isSignUp ? "登録に失敗しました" : "ログインに失敗しました");
      console.error(error);
    } finally {
      setAuthLoading(false);
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
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        size="sm"
        className="items-center gap-2 border-slate-300 hover:bg-slate-50 transition-colors"
      >
        <UserIcon className="h-4 w-4" />
        ログイン
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {isSignUp ? "新規登録" : "ログイン"}
            </h2>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#5B4B8A] hover:bg-[#4a3a73]"
              >
                {authLoading ? "処理中..." : isSignUp ? "登録" : "ログイン"}
              </Button>
            </form>

            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-4 text-sm text-slate-600 hover:text-slate-900 w-full"
            >
              {isSignUp ? "既にアカウントをお持ちの方はこちら" : "新規登録はこちら"}
            </button>
          </Card>
        </div>
      )}
    </>
  );
}
