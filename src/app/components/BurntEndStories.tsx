import { useState, useEffect } from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface Story {
  title: string;
  excerpt: string;
  url: string;
  imageUrl: string;
  date: string;
}

export function BurntEndStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      try {
        // Fetch RSS feed via CORS proxy
        const rssUrl = 'https://www.commune-asia.com/feed';
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch RSS feed');
        }
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Get all items from RSS
        const items = Array.from(xmlDoc.querySelectorAll('item'));
        
        console.log('Total RSS items:', items.length);
        
        // Filter for Burnt End stories only
        const burntEndStories = items
          .filter((item) => {
            const title = item.querySelector('title')?.textContent || '';
            const isBurntEnd = title.toLowerCase().includes('burnt end');
            console.log(`Article: "${title}" - Is Burnt End: ${isBurntEnd}`);
            return isBurntEnd;
          })
          .slice(0, 3) // Get only the 3 most recent
          .map((item) => {
            const title = item.querySelector('title')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            
            // Extract image from enclosure
            const enclosure = item.querySelector('enclosure');
            let imageUrl = enclosure?.getAttribute('url') || '';
            
            // If no enclosure, try to extract from content:encoded
            if (!imageUrl) {
              const content = item.querySelector('content\\:encoded')?.textContent || 
                             item.getElementsByTagName('content:encoded')[0]?.textContent || '';
              const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
              if (imgMatch) {
                imageUrl = imgMatch[1];
              }
            }
            
            // Clean up the title (remove "Burnt Ends:" or "Burnt End:" prefix)
            const cleanTitle = title.replace(/^Burnt Ends?:\s*/i, '');
            
            // Format date
            const date = new Date(pubDate);
            const formattedDate = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            
            return {
              title: cleanTitle,
              excerpt: description,
              url: link,
              imageUrl: imageUrl,
              date: formattedDate
            };
          });
        
        console.log('Burnt End stories found:', burntEndStories.length);
        console.log('Stories:', burntEndStories);
        
        setStories(burntEndStories);
      } catch (error) {
        console.error('Error fetching Burnt End stories:', error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  // Don't render section if still loading or no stories found
  if (loading) {
    return null;
  }

  // If no Burnt End stories, don't show the section
  if (stories.length === 0) {
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
            Read our latest stories on F&B closures
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stories.map((story) => (
            <Card 
              key={story.url} 
              className="hover:shadow-xl transition-all duration-300 overflow-hidden group border-gray-200"
            >
              {/* Image with 40% opacity overlay */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                {story.imageUrl ? (
                  <>
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* 40% opacity dark overlay */}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <span className="text-xs text-white font-medium drop-shadow-lg">
                        {story.date}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0b3860] to-[#072a47]">
                    <BookOpen className="w-12 h-12 text-white/50" />
                  </div>
                )}
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
