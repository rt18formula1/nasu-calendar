import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { CalendarEvent, formatEventDate } from "@/lib/calendar";

interface CalendarItemProps {
  event: CalendarEvent;
  userId: string | null;
}

export function CalendarEventItem({ event, userId }: CalendarItemProps) {
  const formattedDate = formatEventDate(event);

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 flex-1">
        <Button
          disabled={!userId}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-full border-2 border-slate-300 text-slate-400"
        >
          <Check className="h-4 w-4" />
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
