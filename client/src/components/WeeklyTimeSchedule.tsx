import { CalendarEvent } from "@/lib/calendar";
import { CalendarEventItem } from "@/components/CalendarEventItem";
import { User } from "@supabase/supabase-js";

interface WeeklyTimeScheduleProps {
  events: CalendarEvent[];
  selectedDate: Date;
  userId: string | null;
}

export function WeeklyTimeSchedule({ events, selectedDate, userId }: WeeklyTimeScheduleProps) {
  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days: Date[] = [];
  for (let i = 0; i < 4; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push(date);
  }

  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(i);
  }

  const getEventsForDayAndHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date!);
      return eventDate.toDateString() === date.toDateString() && eventDate.getHours() === hour;
    });
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        <div className="text-sm font-medium text-slate-600 py-2 text-center">時間</div>
        {days.map((date, index) => (
          <div key={index} className="text-sm font-medium text-slate-600 py-2 text-center">
            {weekDays[date.getDay()]} {date.getDate()}日
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-5 gap-2">
            <div className="text-xs text-slate-500 py-2 text-center">
              {hour}:00
            </div>
            {days.map((date, dayIndex) => {
              const hourEvents = getEventsForDayAndHour(date, hour);
              return (
                <div
                  key={dayIndex}
                  className="min-h-[40px] border border-slate-200 rounded p-1 bg-white"
                >
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-xs bg-[#5B4B8A]/10 text-[#5B4B8A] px-1 py-0.5 rounded truncate mb-1"
                      title={event.summary}
                    >
                      {event.summary}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
