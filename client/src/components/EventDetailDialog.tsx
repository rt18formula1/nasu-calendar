import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarEvent, formatEventDate } from "@/lib/calendar";
import { supabase } from "@/lib/supabase";
import { Check, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EventDetailDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

interface CalendarEventNote {
  id: string;
  note: string;
}

export function EventDetailDialog({ event, open, onClose, userId }: EventDetailDialogProps) {
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const [existingNote, setExistingNote] = useState<CalendarEventNote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event && userId) {
      loadCheckStatus();
      loadNote();
    }
  }, [event, userId]);

  const loadCheckStatus = async () => {
    if (!userId || !event) return;

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
    if (!userId || !event) return;

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
    if (!userId || !event) {
      toast.error("ログインが必要です");
      return;
    }

    setLoading(true);
    try {
      if (checked) {
        const { error } = await supabase
          .from('calendar_event_checks')
          .delete()
          .eq('user_id', userId)
          .eq('event_id', event.id);

        if (error) {
          console.error("Delete error:", error);
          throw error;
        }
        setChecked(false);
        toast.success("チェックを外しました");
      } else {
        const { error } = await supabase
          .from('calendar_event_checks')
          .upsert({
            user_id: userId,
            event_id: event.id
          }, {
            onConflict: 'user_id,event_id'
          });

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        setChecked(true);
        toast.success("チェックしました");
      }
    } catch (error) {
      console.error("Checkmark error:", error);
      toast.error(`エラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!userId || !event) {
      toast.error("ログインが必要です");
      return;
    }

    setLoading(true);
    try {
      if (existingNote) {
        const { error } = await supabase
          .from('calendar_event_notes')
          .update({ note })
          .eq('id', existingNote.id);

        if (error) throw error;
        toast.success("メモを更新しました");
      } else {
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

  if (!event) return null;

  const formattedDate = formatEventDate(event);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {event.summary}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-1">日時</p>
              <p className="text-sm font-medium text-slate-900">
                {formattedDate}
              </p>
            </div>
            {userId && (
              <Button
                onClick={handleCheck}
                disabled={loading}
                variant="outline"
                size="sm"
                className={`h-10 w-10 p-0 rounded-full border-2 ${
                  checked
                    ? "bg-[#5B4B8A] border-[#5B4B8A] text-white hover:bg-[#4a3a73]"
                    : "border-slate-300 text-slate-400 hover:border-[#5B4B8A] hover:text-[#5B4B8A]"
                }`}
              >
                <Check className="h-5 w-5" />
              </Button>
            )}
          </div>
          {event.description && (
            <div>
              <p className="text-sm text-slate-600 mb-2">詳細</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}
          {userId && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-medium text-slate-700">メモ</p>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="メモを入力..."
                className="w-full text-sm border border-slate-200 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#5B4B8A]"
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
      </DialogContent>
    </Dialog>
  );
}
