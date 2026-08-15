import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarEvent, formatEventDate } from "@/lib/calendar";
import { CalendarEventItem } from "@/components/CalendarEventItem";

interface EventDetailDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

export function EventDetailDialog({ event, open, onClose, userId }: EventDetailDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {event.summary}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">日時</p>
            <p className="text-sm font-medium text-slate-900">
              {formatEventDate(event)}
            </p>
          </div>
          {event.description && (
            <div>
              <p className="text-sm text-slate-600 mb-2">詳細</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}
          <div className="pt-4 border-t border-slate-200">
            <CalendarEventItem event={event} userId={userId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
