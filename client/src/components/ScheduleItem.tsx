import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Check } from "lucide-react";
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

export function ScheduleItem({ day, time, channelName, userId }: ScheduleItemProps) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadCheckStatus();
    }
  }, [userId, day, time, channelName]);

  const loadCheckStatus = async () => {
    if (!userId) return;

    try {
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
    } catch (error) {
      console.error("Error loading check status:", error);
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
          .upsert({
            user_id: userId,
            day_of_week: day,
            time,
            channel_name: channelName
          }, {
            onConflict: 'user_id,day_of_week,time,channel_name'
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
        </div>
      </div>
    </div>
  );
}
