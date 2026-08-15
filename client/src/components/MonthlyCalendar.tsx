import { CalendarEvent, formatEventDate } from "@/lib/calendar";
import { CalendarEventItem } from "@/components/CalendarEventItem";
import { User } from "@supabase/supabase-js";

interface MonthlyCalendarProps {
  events: CalendarEvent[];
  selectedDate: Date;
  userId: string | null;
}

export function MonthlyCalendar({ events, selectedDate, userId }: MonthlyCalendarProps) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date!);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2 text-center">
        {weekDays.map(day => (
          <div key={day} className="text-sm font-medium text-slate-600 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="min-h-[100px] bg-slate-50 rounded-lg" />;
          }

          const dayEvents = getEventsForDay(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 rounded-lg border ${
                isToday ? 'border-[#5B4B8A] bg-[#5B4B8A]/5' : 'border-slate-200 bg-white'
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[#5B4B8A]' : 'text-slate-700'}`}>
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="text-xs bg-[#5B4B8A]/10 text-[#5B4B8A] px-1 py-0.5 rounded truncate"
                    title={event.summary}
                  >
                    {event.summary}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-500">
                    +{dayEvents.length - 3}件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
