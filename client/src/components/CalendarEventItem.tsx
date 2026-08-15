import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarEvent, formatEventDate } from "@/lib/calendar";

interface CalendarItemProps {
  event: CalendarEvent;
  userId: string | null;
}

interface CalendarCheck {
  id: string;
  checked_at: string;
}

export function CalendarEventItem({ event, userId }: CalendarItemProps) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadCheckStatus();
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

  const formattedDate = formatEventDate(event);

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
            <span className="text-sm text-slate-600 w-24">{formattedDate}</span>
            <span className="text-sm font-medium text-slate-900">{event.summary}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
