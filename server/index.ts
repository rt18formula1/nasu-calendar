import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CALENDAR_ID = "5b1c2487b8256ac0966f9699231da20ef9cc6d72d62a77f439b1e8e0e828ce46@group.calendar.google.com";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // API endpoint to get today's calendar events
  app.get("/api/today-events", async (_req, res) => {
    try {
      const today = new Date();
      const timeMin = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const timeMax = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&key=${process.env.GOOGLE_CALENDAR_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        console.error('Google Calendar API error:', data.error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
        return;
      }

      const events = data.items?.map((item: any) => ({
        title: item.summary,
        startTime: new Date(item.start.dateTime || item.start.date),
        endTime: new Date(item.end.dateTime || item.end.date),
        description: item.description
      })) || [];

      res.json({ events });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
