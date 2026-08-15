import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuthButton } from "@/components/AuthButton";
import { ScheduleItem } from "@/components/ScheduleItem";
import { CalendarEventItem } from "@/components/CalendarEventItem";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { WeeklyTimeSchedule } from "@/components/WeeklyTimeSchedule";
import { Calendar, Copy, ExternalLink, Menu, Share2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { getCalendarEvents, CalendarEvent } from "@/lib/calendar";

/**
 * Home Page - pedantic動画投稿カレンダー配布サイト
 * 
 * Design Philosophy: Modern Minimalist with Warmth
 * - Primary Color: Deep Blue-Purple (#5B4B8A) - Trust & Creativity
 * - Secondary Color: Warm Orange (#E8956F) - Approachability
 * - Layout: 2-column responsive design with calendar embed on left, distribution options on right
 * - Typography: Noto Sans JP for Japanese support
 */

const CALENDAR_ID = "5b1c2487b8256ac0966f9699231da20ef9cc6d72d62a77f439b1e8e0e828ce46@group.calendar.google.com";
const CALENDAR_EMBED_URL = `https://calendar.google.com/calendar/embed?src=${CALENDAR_ID}&ctz=Asia%2FTokyo`;
const CALENDAR_SUBSCRIBE_URL = `https://calendar.google.com/calendar/u/0?cid=${CALENDAR_ID}`;

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly' | 'list'>('monthly');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadCalendarEvents();
  }, [selectedDate, calendarView]);

  const loadCalendarEvents = async () => {
    try {
      let startDate: Date;
      let endDate: Date;

      if (calendarView === 'monthly') {
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      } else if (calendarView === 'weekly') {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startDate = startOfWeek;
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endDate = endOfWeek;
      } else {
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      }

      const events = await getCalendarEvents(startDate, endDate);
      setCalendarEvents(events);
    } catch (error) {
      console.error("Failed to load calendar events:", error);
      toast.error("カレンダーイベントの読み込みに失敗しました");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handlePreviousMonth = () => {
    if (calendarView === 'monthly') {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    } else if (calendarView === 'weekly') {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7));
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (calendarView === 'monthly') {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    } else if (calendarView === 'weekly') {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7));
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  const handleCopyCalendarId = () => {
    navigator.clipboard.writeText(CALENDAR_ID);
    setCopied(true);
    toast.success("カレンダーIDをコピーしました");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareUrl = "https://yurugakuto-calendar.vercel.app/";
    const shareText = "ゆる学徒界隈の動画公開スケジュールを確認できるカレンダー！";
    const shareAccount = "@rt18_yurugakuto";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&via=${shareAccount.replace("@", "")}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };

  const handleCalendarSubscribe = () => {
    setCalendarAdded(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-slate-900">pedantic calendar</h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden gap-6 md:flex">
              <a href="#calendar" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                カレンダー
              </a>
              <a href="#distribute" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                配布方法
              </a>
            </nav>
            <AuthButton />
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Xにシェア
            </Button>
            <button
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-slate-200 bg-white px-4 py-4">
            <a
              href="#calendar"
              className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              カレンダー
            </a>
            <a
              href="#distribute"
              className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              配布方法
            </a>
            <Button
              onClick={() => {
                handleShare();
                setMobileMenuOpen(false);
              }}
              variant="outline"
              size="sm"
              className="mt-2 w-full items-center gap-2 border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Xにシェア
            </Button>
            <div className="mt-2">
              <AuthButton />
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-12 md:py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
              ゆる学徒公開カレンダー
            </h2>
            <p className="mb-8 text-lg text-slate-600">
              ※非公式 ゆる学徒界隈のラジオの動画公開スケジュールのカレンダーです。
              <br />
              ライブ配信やイベントまでは追加できませんがお許しください。ファンが運営するサイトなので株式会社pedanticに問い合わせするのはおやめください。
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 py-12 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <img
                src="/無題 - 2026年8月08日 14.10.24.png"
                alt="About pedantic calendar"
                className="w-auto h-auto max-h-[300px] object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-slate-700 leading-relaxed">
                ついに株式会社pedanticのチャンネルまで誕生しpedantic動画を毎日パトロールするゆる学徒でも抜け漏れが出てくるようになってきました。
                実際にコメントしてみると共感の声もいただけたので毎週投稿のチャンネルのGoogleCalendarを作成しました。
                是非楽しいゆる学徒ライフにお役立てください。
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Main Content */}
      <section id="calendar" className="px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Calendar Views */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">カレンダー</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                        <Button
                          onClick={() => setCalendarView('monthly')}
                          variant={calendarView === 'monthly' ? 'default' : 'ghost'}
                          size="sm"
                          className={`text-xs ${calendarView === 'monthly' ? 'bg-[#5B4B8A] text-white' : 'text-slate-600'}`}
                        >
                          月
                        </Button>
                        <Button
                          onClick={() => setCalendarView('weekly')}
                          variant={calendarView === 'weekly' ? 'default' : 'ghost'}
                          size="sm"
                          className={`text-xs ${calendarView === 'weekly' ? 'bg-[#5B4B8A] text-white' : 'text-slate-600'}`}
                        >
                          週
                        </Button>
                        <Button
                          onClick={() => setCalendarView('list')}
                          variant={calendarView === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          className={`text-xs ${calendarView === 'list' ? 'bg-[#5B4B8A] text-white' : 'text-slate-600'}`}
                        >
                          リスト
                        </Button>
                      </div>
                      <Button
                        onClick={handlePreviousMonth}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium text-slate-700 min-w-[100px] text-center">
                        {formatMonth(selectedDate)}
                      </span>
                      <Button
                        onClick={handleNextMonth}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleToday}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        今日
                      </Button>
                    </div>
                  </div>
                  {loadingEvents ? (
                    <div className="text-center py-8 text-slate-500">
                      カレンダーイベントを読み込み中...
                    </div>
                  ) : calendarView === 'monthly' ? (
                    <MonthlyCalendar events={calendarEvents} selectedDate={selectedDate} userId={user?.id ?? null} />
                  ) : calendarView === 'weekly' ? (
                    <WeeklyTimeSchedule events={calendarEvents} selectedDate={selectedDate} userId={user?.id ?? null} />
                  ) : (
                    <div className="space-y-0">
                      {calendarEvents.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          イベントが見つかりません
                        </div>
                      ) : (
                        calendarEvents.map((event) => (
                          <CalendarEventItem key={event.id} event={event} userId={user?.id ?? null} />
                        ))
                      )}
                    </div>
                  )}
                  {!user && (
                    <p className="mt-4 text-xs text-slate-400 text-center">
                      ログインするとチェックマークとメモ機能が使えます
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                このカレンダーはリアルタイムで更新されます。定期的にチェックしてください。
              </p>
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">週次スケジュール</h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePreviousMonth}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-slate-700 min-w-[100px] text-center">
                    {formatMonth(selectedDate)}
                  </span>
                  <Button
                    onClick={handleNextMonth}
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleToday}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    今日
                  </Button>
                </div>
              </div>
              <Card className="border-slate-200 p-6 rounded-xl">
                <div className="space-y-0">
                  <ScheduleItem day="日" time="午前9:45" channelName="ゆるコンピュータ科学ラジオ" userId={user?.id ?? null} />
                  <ScheduleItem day="日" time="午後8時" channelName="ゆる民俗学ラジオ" userId={user?.id ?? null} />
                  <ScheduleItem day="月" time="午後4時" channelName="博士と道化師" userId={user?.id ?? null} />
                  <ScheduleItem day="月" time="午後5時" channelName="積読チャンネル" userId={user?.id ?? null} />
                  <ScheduleItem day="火" time="午後6:45" channelName="ゆる言語学ラジオ" userId={user?.id ?? null} />
                  <ScheduleItem day="火" time="午後8時" channelName="煩悩どこまでも" userId={user?.id ?? null} />
                  <ScheduleItem day="水" time="午後6:45" channelName="ゆる学徒カフェ" userId={user?.id ?? null} />
                  <ScheduleItem day="水" time="午後8時" channelName="白黒つけない会議" userId={user?.id ?? null} />
                  <ScheduleItem day="木" time="午後6時" channelName="歌舞伎町にかぶりつけ!【かぶかぶ】" userId={user?.id ?? null} />
                  <ScheduleItem day="木" time="午後8時" channelName="ゆる天文学ラジオ" userId={user?.id ?? null} />
                  <ScheduleItem day="金" time="午後5時" channelName="積読チャンネル" userId={user?.id ?? null} />
                  <ScheduleItem day="金" time="午後7時" channelName="株式会社pedantic" userId={user?.id ?? null} />
                  <ScheduleItem day="金" time="午後8時" channelName="ゆる音楽学ラジオ" userId={user?.id ?? null} />
                  <ScheduleItem day="土" time="午前9:45" channelName="白黒つけない会議" userId={user?.id ?? null} />
                  <ScheduleItem day="土" time="午後8時" channelName="ゆる哲学ラジオ" userId={user?.id ?? null} />
                </div>
                {!user && (
                  <p className="mt-4 text-xs text-slate-400 text-center">
                    ログインするとチェックマークとメモ機能が使えます
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Distribution Section */}
      <section id="distribute" className="px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Distribution Options */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">配布方法</h3>

              {/* Subscribe Card */}
              <Card className="border-slate-200 p-6 hover:shadow-lg transition-all hover:border-[#5B4B8A]/30 rounded-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-[#5B4B8A]/10 p-2">
                    <Calendar className="h-5 w-5 text-[#5B4B8A]" />
                  </div>
                  <h4 className="font-semibold text-slate-900">Googleカレンダーに追加</h4>
                </div>
                <p className="mb-4 text-sm text-slate-600">
                  このカレンダーをあなたのGoogleカレンダーに購読登録します。
                </p>
                <Button
                  asChild
                  className="w-full bg-[#5B4B8A] hover:bg-[#4a3a73] transition-colors"
                  onClick={handleCalendarSubscribe}
                >
                  <a href={CALENDAR_SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    カレンダーに追加
                  </a>
                </Button>
                {calendarAdded && (
                  <div className="mt-4 rounded-lg bg-gradient-to-r from-[#5B4B8A]/10 to-[#E8956F]/10 p-4 border border-[#5B4B8A]/20">
                    <p className="mb-3 text-sm font-medium text-slate-700">
                      🎉 カレンダーに追加しました！
                    </p>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="sm"
                      className="w-full items-center gap-2 border-[#5B4B8A]/30 hover:bg-[#5B4B8A]/5 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                      このカレンダーをXにシェアしませんか？
                    </Button>
                  </div>
                )}
              </Card>

              {/* Calendar ID Card */}
              <Card className="border-slate-200 p-6 hover:shadow-lg transition-all hover:border-[#4CAF50]/30 rounded-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-[#4CAF50]/10 p-2">
                    <Copy className="h-5 w-5 text-[#4CAF50]" />
                  </div>
                  <h4 className="font-semibold text-slate-900">カレンダーID</h4>
                </div>
                <p className="mb-3 text-xs text-slate-500">
                  このIDを使用して、他のアプリケーションに統合できます。
                </p>
                <div className="mb-3 break-all rounded-lg bg-slate-100 p-3 font-mono text-xs text-slate-700 border border-slate-200">
                  {CALENDAR_ID}
                </div>
                <Button
                  onClick={handleCopyCalendarId}
                  variant="outline"
                  className="w-full border-slate-300 hover:bg-[#4CAF50]/5 transition-colors"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "コピーしました!" : "コピー"}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center text-sm text-slate-300">
            <p className="mb-4">&copy; 2026 rt18_formula1. All rights reserved.</p>
            <div className="flex flex-col justify-center gap-4 md:flex-row md:gap-6">
              <a
                href="https://x.com/rt18_yurugakuto"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                X: @rt18_yurugakuto
              </a>
              <a
                href="https://instagram.com/rt18_formula1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Instagram: rt18_formula1
              </a>
              <a
                href="https://github.com/rt18formula1/nasu-calendar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://rt18-formula1-official-site.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Official Web Site
              </a>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              ※お問い合わせはSNSまで
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
