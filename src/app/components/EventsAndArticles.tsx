import { useState, useEffect } from 'react';
import { Calendar, Newspaper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { fetchEvents, formatEventDate } from '@/app/data/events';
import { fetchArticles } from '@/app/data/articles';
import type { Event } from '@/app/data/events';
import type { Article } from '@/app/data/articles';

export function EventsAndArticles() {
  const [events, setEvents] = useState<Event[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [eventsData, articlesData] = await Promise.all([
          fetchEvents(),
          fetchArticles()
        ]);
        setEvents(eventsData);
        setArticles(articlesData);
      } catch (error) {
        console.error('Error loading events and articles:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-[#0b3860]">Get help before your business becomes another statistic here</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Events and useful articles sourced from authoritative sources
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Events Section */}
        <div>
          <Card className="border-[#0b3860]/20">
            <CardHeader className="bg-[#0b3860] items-center min-h-[70px]">
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-[#f5903e]" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No upcoming events at the moment.</p>
                  <p className="text-xs mt-2">Check back soon for industry events and workshops.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    event.url ? (
                      <a
                        key={event.event_id}
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      className="block border-l-4 border-[#f5903e] pl-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-[#0b3860] hover:text-[#f5903e]">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{formatEventDate(event.date)}</p>
                      <p className="text-sm text-gray-500">{event.location} • {event.source}</p>
                    </a>
                    ) : (
                    <div key={event.event_id} className="border-l-4 border-[#f5903e] pl-4 py-2">
                      <h3 className="font-semibold text-[#0b3860]">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{formatEventDate(event.date)}</p>
                      <p className="text-sm text-gray-500">{event.location} • {event.source}</p>
                    </div>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Articles Section */}
        <div>
          <Card className="border-[#0b3860]/20">
            <CardHeader className="bg-[#0b3860] items-center min-h-[70px]">
              <CardTitle className="flex items-center gap-2 text-white">
                <Newspaper className="w-5 h-5 text-[#f5903e]" />
                Relevant Articles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {articles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No articles curated yet.</p>
                  <p className="text-xs mt-2">Check back soon for industry insights.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <a
                      key={article.article_id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border-l-4 border-[#f5903e] pl-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-[#0b3860] hover:text-[#f5903e]">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{article.source}</p>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}