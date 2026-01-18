import { Calendar, Newspaper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
}

interface Article {
  id: number;
  title: string;
  source: string;
  url: string;
}

export function EventsAndArticles() {
  // Mock data - in production, this would come from an API
  const events: Event[] = [
    {
      id: 1,
      title: "F&B Industry Resilience Workshop",
      date: "Feb 5, 2026",
      location: "Suntec Convention Centre"
    },
    {
      id: 2,
      title: "Restaurant Owners Networking Mixer",
      date: "Feb 12, 2026",
      location: "Marina Bay Sands"
    },
    {
      id: 3,
      title: "Singapore Food Innovation Summit",
      date: "Mar 1, 2026",
      location: "Raffles City Convention Centre"
    }
  ];

  const articles: Article[] = [
    {
      id: 1,
      title: "Rising Costs Force More F&B Closures in 2026",
      source: "The Straits Times",
      url: "#"
    },
    {
      id: 2,
      title: "How Singapore's F&B Industry is Adapting",
      source: "Channel NewsAsia",
      url: "#"
    },
    {
      id: 3,
      title: "Government Support for Struggling Restaurants",
      source: "TODAY",
      url: "#"
    }
  ];

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0b3860]">Resources for F&B Owners</h2>
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
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border-l-4 border-[#f5903e] pl-4 py-2 hover:bg-gray-50 transition-colors">
                    <h3 className="font-semibold text-[#0b3860]">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                {articles.map((article) => (
                  <a
                    key={article.id}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}