/**
 * Events data fetching
 * Fetches from Google Sheets Events sheet
 */

export interface Event {
  event_id: number;
  title: string;
  date: string;
  location: string;
  url: string;
  source: string;
  scraped_at: string;
}

const EVENTS_CSV_URL = import.meta.env.VITE_EVENTS_CSV_URL || '';

/**
 * Fetch events from Google Sheets
 */
export async function fetchEvents(): Promise<Event[]> {
  if (!EVENTS_CSV_URL) {
    console.warn('VITE_EVENTS_CSV_URL not configured');
    return [];
  }

  try {
    const response = await fetch(EVENTS_CSV_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const events = parseEventsCSV(csvText);
    
    // Filter out past events and sort by date
    const now = new Date();
    const upcomingEvents = events
      .filter(event => {
        if (event.date === 'TBA') return true;
        const eventDate = new Date(event.date);
        return eventDate >= now;
      })
      .sort((a, b) => {
        if (a.date === 'TBA') return 1;
        if (b.date === 'TBA') return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

    return upcomingEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Parse CSV data into Event objects
 */
function parseEventsCSV(csvText: string): Event[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length <= 1) {
    return [];
  }

  // Skip header row
  const dataLines = lines.slice(1);
  
  return dataLines.map(line => {
    const values = parseCSVLine(line);
    
    return {
      event_id: parseInt(values[0]) || 0,
      title: values[1] || '',
      date: values[2] || '',
      location: values[3] || '',
      url: values[4] || '',
      source: values[5] || '',
      scraped_at: values[6] || ''
    };
  }).filter(event => event.title && event.url);
}

/**
 * Parse a single CSV line (handles quoted fields)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Format event date for display
 */
export function formatEventDate(dateStr: string): string {
  if (dateStr === 'TBA') return 'Date TBA';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
