import { useState, useEffect } from 'react';
import { ExternalLink, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface Story {
  title: string;
  excerpt: string;
  url: string;
  imageUrl: string;
  date: string;
  series: 'burnt-end' | 'good-bites' | 'off-menu';
}

export function LatestStories() {
  const [burntEndStories, setBurntEndStories] = useState<Story[]>([]);
  const [goodBitesStories, setGoodBitesStories] = useState<Story[]>([]);
  const [offMenuStories, setOffMenuStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [burntEndIndex, setBurntEndIndex] = useState(0);
  const [goodBitesIndex, setGoodBitesIndex] = useState(0);

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
        
        // Filter and categorize stories
        const burntEnd: Story[] = [];
        const goodBites: Story[] = [];
        const offMenu: Story[] = [];
        
        items.forEach((item) => {
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
          
          // Format date
          const date = new Date(pubDate);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          
          // Categorize by series
          if (title.toLowerCase().includes('burnt end')) {
            const cleanTitle = title.replace(/^Burnt Ends?:\s*/i, '');
            burntEnd.push({
              title: cleanTitle,
              excerpt: description,
              url: link,
              imageUrl,
              date: formattedDate,
              series: 'burnt-end'
            });
          } else if (title.toLowerCase().includes('good bites')) {
            const cleanTitle = title.replace(/^Good Bites:\s*/i, '');
            goodBites.push({
              title: cleanTitle,
              excerpt: description,
              url: link,
              imageUrl,
              date: formattedDate,
              series: 'good-bites'
            });
          } else if (title.toLowerCase().includes('off menu')) {
            const cleanTitle = title.replace(/^Off Menu:\s*/i, '');
            offMenu.push({
              title: cleanTitle,
              excerpt: description,
              url: link,
              imageUrl,
              date: formattedDate,
              series: 'off-menu'
            });
          }
        });
        
        console.log('Burnt End stories:', burntEnd.length);
        console.log('Good Bites stories:', goodBites.length);
        console.log('Off Menu stories:', offMenu.length);
        
        setBurntEndStories(burntEnd.slice(0, 6)); // Get up to 6 for carousel
        setGoodBitesStories(goodBites.slice(0, 6));
        setOffMenuStories(offMenu.slice(0, 6));
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  const StoryCard = ({ story }: { story: Story }) => (
    <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden group border-gray-200 h-full">
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
  );

  const Carousel = ({ 
    stories, 
    currentIndex, 
    setIndex, 
    title, 
    viewAllUrl 
  }: { 
    stories: Story[]; 
    currentIndex: number; 
    setIndex: (index: number) => void;
    title: string;
    viewAllUrl: string;
  }) => {
    if (stories.length === 0) return null;

    const visibleStories = stories.slice(currentIndex, currentIndex + 3);
    const canGoBack = currentIndex > 0;
    const canGoForward = currentIndex + 3 < stories.length;

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#0b3860]">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIndex(Math.max(0, currentIndex - 3))}
              disabled={!canGoBack}
              className={`p-2 rounded-full border transition-all ${
                canGoBack
                  ? 'border-[#0b3860] text-[#0b3860] hover:bg-[#0b3860] hover:text-white'
                  : 'border-gray-300 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIndex(currentIndex + 3)}
              disabled={!canGoForward}
              className={`p-2 rounded-full border transition-all ${
                canGoForward
                  ? 'border-[#0b3860] text-[#0b3860] hover:bg-[#0b3860] hover:text-white'
                  : 'border-gray-300 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {visibleStories.map((story) => (
            <StoryCard key={story.url} story={story} />
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => window.open(viewAllUrl, '_blank')}
            variant="outline"
            className="border-[#0b3860] text-[#0b3860] hover:bg-[#0b3860] hover:text-white font-semibold px-6"
          >
            View All {title}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  // Don't render section if still loading
  if (loading) {
    return null;
  }

  // Don't render if no stories at all
  if (burntEndStories.length === 0 && goodBitesStories.length === 0 && offMenuStories.length === 0) {
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
              Our Latest Stories
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Analysis and insights into F&B failures and leaders
          </p>
        </div>

        {/* Burnt End Stories Carousel */}
        <Carousel
          stories={burntEndStories}
          currentIndex={burntEndIndex}
          setIndex={setBurntEndIndex}
          title="Burnt End Stories"
          viewAllUrl="https://commune-asia.com/burnt-end"
        />

        {/* Good Bites Stories Carousel */}
        <Carousel
          stories={goodBitesStories}
          currentIndex={goodBitesIndex}
          setIndex={setGoodBitesIndex}
          title="Good Bites"
          viewAllUrl="https://commune-asia.com/good-bites"
        />

        {/* Off Menu Stories - Coming Soon Placeholder */}
        {offMenuStories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">Off Menu Series</h3>
            <p className="text-gray-500">Coming Soon</p>
          </div>
        )}
      </div>
    </section>
  );
}
