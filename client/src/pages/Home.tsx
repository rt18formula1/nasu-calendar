import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
const ICS_URL = `https://calendar.google.com/calendar/ical/${CALENDAR_ID}/public/basic.ics`;

interface CalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

function parseICS(icsData: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icsData.split('\n');
  let currentEvent: Partial<CalendarEvent> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT') && currentEvent) {
      if (currentEvent.title && currentEvent.startTime) {
        events.push(currentEvent as CalendarEvent);
      }
      currentEvent = null;
    } else if (line.startsWith('SUMMARY:') && currentEvent) {
      currentEvent.title = line.substring(8);
    } else if (line.startsWith('DTSTART:') && currentEvent) {
      const dateStr = line.substring(8);
      currentEvent.startTime = new Date(dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8) + 'T' + dateStr.substring(9, 11) + ':' + dateStr.substring(11, 13) + ':00');
    } else if (line.startsWith('DTEND:') && currentEvent) {
      const dateStr = line.substring(6);
      currentEvent.endTime = new Date(dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8) + 'T' + dateStr.substring(9, 11) + ':' + dateStr.substring(11, 13) + ':00');
    } else if (line.startsWith('DESCRIPTION:') && currentEvent) {
      currentEvent.description = line.substring(12);
    }
  }

  return events;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' });
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        const response = await fetch(ICS_URL);
        const icsData = await response.text();
        const allEvents = parseICS(icsData);
        const eventsToday = allEvents.filter(event => isToday(event.startTime));
        setTodayEvents(eventsToday);
      } catch (error) {
        console.error('Failed to fetch calendar events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayEvents();
  }, []);

  const handleCopyCalendarId = () => {
    navigator.clipboard.writeText(CALENDAR_ID);
    setCopied(true);
    toast.success("カレンダーIDをコピーしました");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">pedantic calendar</h1>
          </div>
          <nav className="hidden gap-6 md:flex">
            <a href="#calendar" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              カレンダー
            </a>
            <a href="#distribute" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              配布方法
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-12 md:py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
              pedantic動画投稿カレンダー
            </h2>
            <p className="mb-8 text-lg text-slate-600">
              ※非公式 ゆる学徒界隈のラジオの動画公開スケジュールのカレンダーです。
              <br />
              ライブ配信やイベントまでは追加できませんがお許しください。ファンが運営するサイトなので株式会社Pedanticに問い合わせするのはおやめください。
            </p>
          </div>
        </div>
      </section>

      {/* Today's Schedule Section */}
      <section className="px-4 py-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-6 w-6 text-[#E8956F]" />
              今日の予定
            </h3>
            <p className="text-slate-600 mt-1">{formatDate(new Date())}</p>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-slate-500">
              読み込み中...
            </div>
          ) : todayEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todayEvents.map((event, index) => (
                <Card key={index} className="border-slate-200 p-5 hover:shadow-lg transition-all hover:border-[#E8956F]/30 rounded-xl">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#E8956F]">
                    <Clock className="h-4 w-4" />
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{event.description}</p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-slate-200 p-8 text-center rounded-xl">
              <p className="text-slate-500">今日の予定はありません</p>
            </Card>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section id="calendar" className="px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Calendar Embed */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow">
                <iframe
                  src={CALENDAR_EMBED_URL}
                  style={{ border: 0 }}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  scrolling="no"
                  title="pedantic動画投稿カレンダー"
                />
              </div>
              <p className="mt-4 text-sm text-slate-500">
                このカレンダーはリアルタイムで更新されます。定期的にチェックしてください。
              </p>
            </div>

            {/* Distribution Options */}
            <div id="distribute" className="space-y-4">
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
                >
                  <a href={CALENDAR_SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    購読する
                  </a>
                </Button>
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
            <div className="flex justify-center gap-6">
              <a
                href="https://x.com/rt18_formula1_x"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                X: rt18_formula1_x
              </a>
              <a
                href="https://instagram.com/rt18_formula1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Instagram: rt18_formula1
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
