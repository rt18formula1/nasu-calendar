import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Check, ChevronDown, ChevronUp, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarEvent, formatEventDate } from "@/lib/calendar";

interface CalendarEventItemProps {
  event: CalendarEvent;
  userId: string | null;
}

interface CalendarEventCheck {
  id: string;
  checked_at: string;
}

interface CalendarEventNote {
  id: string;
  note: string;
}

export function CalendarEventItem({ event, userId }: CalendarEventItemProps) {
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const [existingNote, setExistingNote] = useState<CalendarEventNote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadCheckStatus();
      loadNote();
    }
  }, [userId, event.id]);

  const loadCheckStatus = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('calendar_event_checks')
      .select('id, checked_at')
      .eq('user_id', userId)
      .eq('event_id', event.id)
      .single();

    if (data && !error) {
      setChecked(true);
    }
  };

  const loadNote = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('calendar_event_notes')
      .select('id, note')
      .eq('user_id', userId)
      .eq('event_id', event.id)
      .single();

    if (data && !error) {
      setExistingNote(data);
      setNote(data.note);
    }
  };

  const handleCheck = async () => {
    if (!userId) {
      toast.error("ログインが必要です");
      return;
    }

    setLoading(true);
    try {
      if (checked) {
        // Remove check
        const { error } = await supabase
          .from('calendar_event_checks')
          .delete()
          .eq('user_id', userId)
          .eq('event_id', event.id);

        if (error) throw error;
        setChecked(false);
        toast.success("チェックを外しました");
      } else {
        // Add check
        const { error } = await supabase
          .from('calendar_event_checks')
          .insert({
            user_id: userId,
            event_id: event.id
          });

        if (error) throw error;
        setChecked(true);
        toast.success("チェックしました");
      }
    } catch (error) {
      toast.error("エラーが発生しました");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!userId) {
      toast.error("ログインが必要です");
      return;
    }

    setLoading(true);
    try {
      if (existingNote) {
        // Update note
        const { error } = await supabase
          .from('calendar_event_notes')
          .update({ note })
          .eq('id', existingNote.id);

        if (error) throw error;
        toast.success("メモを更新しました");
      } else {
        // Insert note
        const { error } = await supabase
          .from('calendar_event_notes')
          .insert({
            user_id: userId,
            event_id: event.id,
            note
          });

        if (error) throw error;
        toast.success("メモを保存しました");
      }

      await loadNote();
    } catch (error) {
      toast.error("エラーが発生しました");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!userId || !existingNote) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('calendar_event_notes')
        .delete()
        .eq('id', existingNote.id);

      if (error) throw error;
      setNote("");
      setExistingNote(null);
      toast.success("メモを削除しました");
    } catch (error) {
      toast.error("エラーが発生しました");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = formatEventDate(event);

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 relative">
      <div className="flex items-center gap-3 flex-1">
        <Button
          onClick={handleCheck}
          disabled={loading || !userId}
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 rounded-full ${
            checked
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "hover:bg-slate-100 text-slate-400"
          }`}
        >
          {checked ? <Check className="h-4 w-4" /> : <div className="h-4 w-4" />}
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 w-24">{formattedDate}</span>
            <span className="text-sm font-medium text-slate-900">{event.summary}</span>
          </div>
          {existingNote && (
            <div className="mt-1 ml-28 flex items-center gap-2">
              <MessageSquare className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500">{existingNote.note}</span>
            </div>
          )}
        </div>
      </div>
      {userId && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-3 z-10">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="メモを入力..."
            className="w-full text-sm border border-slate-200 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleSaveNote}
              disabled={loading}
              size="sm"
              className="flex-1 bg-[#5B4B8A] hover:bg-[#4a3a73]"
            >
              保存
            </Button>
            {existingNote && (
              <Button
                onClick={handleDeleteNote}
                disabled={loading}
                variant="outline"
                size="sm"
                className="border-red-300 hover:bg-red-50 text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
