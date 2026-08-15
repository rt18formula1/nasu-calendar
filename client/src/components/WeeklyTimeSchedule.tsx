import { CalendarEvent } from "@/lib/calendar";
import { EventDetailDialog } from "@/components/EventDetailDialog";
import { User } from "@supabase/supabase-js";
import { useState } from "react";

interface WeeklyTimeScheduleProps {
  events: CalendarEvent[];
  selectedDate: Date;
  userId: string | null;
}

export function WeeklyTimeSchedule({ events, selectedDate, userId }: WeeklyTimeScheduleProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push(date);
  }

  const hours = [];
  for (let i = 6; i < 24; i++) {
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
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 text-center w-16">時間</th>
            {days.map((date, index) => (
              <th key={index} className="border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 text-center w-16">
                {weekDays[date.getDay()]} {date.getDate()}日
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour}>
              <td className="border border-slate-300 px-2 py-1 text-xs text-slate-600 text-center w-16">
                {hour}:00
              </td>
              {days.map((date, dayIndex) => {
                const hourEvents = getEventsForDayAndHour(date, hour);
                return (
                  <td key={dayIndex} className="border border-slate-300 px-1 py-1 align-top w-16">
                    {hourEvents.map(event => (
                      <div
                        key={event.id}
                        className="text-[10px] bg-[#5B4B8A]/10 text-[#5B4B8A] px-1 py-0.5 rounded truncate mb-0.5 cursor-pointer hover:bg-[#5B4B8A]/20"
                        title={event.summary}
                        onClick={() => {
                          setSelectedEvent(event);
                          setDialogOpen(true);
                        }}
                      >
                        {event.summary}
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <EventDetailDialog
        event={selectedEvent}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedEvent(null);
        }}
        userId={userId}
      />
    </div>
  );
}
