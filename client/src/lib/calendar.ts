const CALENDAR_ID = "5b1c2487b8256ac0966f9699231da20ef9cc6d72d62a77f439b1e8e0e828ce46@group.calendar.google.com";
const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;

export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

export async function getCalendarEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
  if (!API_KEY) {
    throw new Error("Google Calendar API key is missing");
  }

  const start = startDate || new Date();
  const end = endDate || new Date(start.getFullYear(), start.getMonth() + 1, 0);

  const timeMin = start.toISOString();
  const timeMax = end.toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
}

export function formatEventDate(event: CalendarEvent): string {
  if (event.start.dateTime) {
    const date = new Date(event.start.dateTime);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const day = dayNames[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    let timeStr = '';
    if (hours >= 0 && hours < 12) {
      timeStr = `午前${hours}:${minutes.toString().padStart(2, '0')}`;
    } else {
      timeStr = `午後${hours - 12}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return `${day} ${timeStr}`;
  }
  return '';
}
