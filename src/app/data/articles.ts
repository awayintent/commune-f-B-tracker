/**
 * Articles data fetching
 * Fetches from Google Sheets Articles sheet
 */

export interface Article {
  article_id: number;
  title: string;
  source: string;
  author: string;
  url: string;
  published_date: string;
  scraped_at: string;
}

const ARTICLES_CSV_URL = import.meta.env.VITE_ARTICLES_CSV_URL || '';

/**
 * Fetch articles from Google Sheets
 */
export async function fetchArticles(): Promise<Article[]> {
  if (!ARTICLES_CSV_URL) {
    console.warn('VITE_ARTICLES_CSV_URL not configured');
    return [];
  }

  try {
    const response = await fetch(ARTICLES_CSV_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const articles = parseArticlesCSV(csvText);
    
    // Sort by published date (most recent first), limit to 5
    const recentArticles = articles
      .sort((a, b) => {
        return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
      })
      .slice(0, 5);

    return recentArticles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

/**
 * Parse CSV data into Article objects
 */
function parseArticlesCSV(csvText: string): Article[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length <= 1) {
    return [];
  }

  // Skip header row
  const dataLines = lines.slice(1);
  
  return dataLines.map(line => {
    const values = parseCSVLine(line);
    
    return {
      article_id: parseInt(values[0]) || 0,
      title: values[1] || '',
      source: values[2] || '',
      author: values[3] || '',
      url: values[4] || '',
      published_date: values[5] || '',
      scraped_at: values[6] || ''
    };
  }).filter(article => article.title && article.url);
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
 * Format article published date for display
 */
export function formatArticleDate(dateStr: string): string {
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
