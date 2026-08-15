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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (userId) {
      loadCheckStatus();
    }
  }, [userId, event.id]);

  const loadCheckStatus = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('calendar_event_checks')
        .select('id, checked_at')
        .eq('user_id', userId)
        .eq('event_id', event.id)
        .single();

      if (data && !error) {
        setChecked(true);
      }
    } catch (error) {
      console.error("Error loading check status:", error);
      setError(true);
      // Don't throw error, just continue without check status
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

  const formattedDate = formatEventDate(event);

  // Always render the component regardless of errors
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 flex-1">
        <Button
          onClick={handleCheck}
          disabled={loading || !userId || error}
          variant="outline"
          size="sm"
          className={`h-8 w-8 p-0 rounded-full border-2 ${
            checked
              ? "bg-[#5B4B8A] border-[#5B4B8A] text-white hover:bg-[#4a3a73]"
              : "border-slate-300 text-slate-400 hover:border-[#5B4B8A] hover:text-[#5B4B8A]"
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
