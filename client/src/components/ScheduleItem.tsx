import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Check, ChevronDown, ChevronUp, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ScheduleItemProps {
  day: string;
  time: string;
  channelName: string;
  userId: string | null;
}

interface ScheduleCheck {
  id: string;
  checked_at: string;
}

interface ScheduleNote {
  id: string;
  note: string;
}

export function ScheduleItem({ day, time, channelName, userId }: ScheduleItemProps) {
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [existingNote, setExistingNote] = useState<ScheduleNote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadCheckStatus();
      loadNote();
    }
  }, [userId, day, time, channelName]);

  const loadCheckStatus = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('schedule_checks')
      .select('id, checked_at')
      .eq('user_id', userId)
      .eq('day_of_week', day)
      .eq('time', time)
      .eq('channel_name', channelName)
      .single();

    if (data && !error) {
      setChecked(true);
}
  };

  const loadNote = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('schedule_notes')
      .select('id, note')
      .eq('user_id', userId)
      .eq('day_of_week', day)
      .eq('time', time)
      .eq('channel_name', channelName)
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
          .from('schedule_checks')
          .delete()
          .eq('user_id', userId)
          .eq('day_of_week', day)
          .eq('time', time)
          .eq('channel_name', channelName);

        if (error) throw error;
        setChecked(false);
        toast.success("チェックを外しました");
      } else {
        // Add check
        const { error } = await supabase
          .from('schedule_checks')
          .insert({
            user_id: userId,
            day_of_week: day,
            time,
            channel_name: channelName
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
          .from('schedule_notes')
          .update({ note })
          .eq('id', existingNote.id);

        if (error) throw error;
        toast.success("メモを更新しました");
      } else {
        // Insert note
        const { error } = await supabase
          .from('schedule_notes')
          .insert({
            user_id: userId,
            day_of_week: day,
            time,
            channel_name: channelName,
            note
          });

        if (error) throw error;
        toast.success("メモを保存しました");
      }

      await loadNote();
      setShowNoteInput(false);
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
        .from('schedule_notes')
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

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
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
            <span className="text-sm text-slate-600 w-16">{day}</span>
            <span className="text-sm text-slate-600 w-20">{time}</span>
            <span className="text-sm font-medium text-slate-900">{channelName}</span>
          </div>
          {existingNote && !showNoteInput && (
            <div className="mt-1 ml-36 flex items-center gap-2">
              <MessageSquare className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500">{existingNote.note}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {userId && (
          <Button
            onClick={() => setShowNoteInput(!showNoteInput)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            {showNoteInput ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>
      {showNoteInput && userId && (
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
