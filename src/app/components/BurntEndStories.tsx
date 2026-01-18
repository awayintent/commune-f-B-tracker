import { useState, useEffect } from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface Story {
  id: number;
  title: string;
  excerpt: string;
  url: string;
  imageUrl: string;
  date: string;
  readTime: string;
}

export function BurntEndStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace this with actual RSS feed or API from commune-asia.com
    // For now, we'll hide the section until you provide the RSS feed URL
    // You can add: VITE_BURNT_END_RSS_URL to your environment variables
    
    const rssUrl = import.meta.env.VITE_BURNT_END_RSS_URL;
    
    if (!rssUrl) {
      console.log('VITE_BURNT_END_RSS_URL not configured - Burnt End Stories section hidden');
      setLoading(false);
      return;
    }

    // Fetch RSS feed when available
    async function fetchStories() {
      try {
        // This will be implemented once you provide the RSS feed URL
        // For now, return empty array
        setStories([]);
      } catch (error) {
        console.error('Error fetching Burnt End stories:', error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  // Don't render section if no stories or still loading
  if (loading || stories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-8 h-8 text-[#f5903e]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b3860]">
              Burnt End Stories
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Long-form analysis of F&B business failures in Singapore. 
            Learn from the mistakes of others and understand the real reasons behind closures.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stories.map((story) => (
            <Card 
              key={story.id} 
              className="hover:shadow-xl transition-all duration-300 overflow-hidden group border-gray-200"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-xs text-white/90 font-medium">
                    {story.date} • {story.readTime}
                  </span>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-[#0b3860] mb-2 line-clamp-2 group-hover:text-[#f5903e] transition-colors">
                  {story.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {story.excerpt}
                </p>
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#f5903e] hover:text-[#e07d2a] font-semibold text-sm transition-colors"
                >
                  Read Full Story
                  <ExternalLink className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA to View All Stories */}
        <div className="text-center">
          <Button
            onClick={() => window.open('https://commune-asia.com/burnt-end', '_blank')}
            variant="outline"
            className="border-[#0b3860] text-[#0b3860] hover:bg-[#0b3860] hover:text-white font-semibold px-8"
          >
            View All Burnt End Stories
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
