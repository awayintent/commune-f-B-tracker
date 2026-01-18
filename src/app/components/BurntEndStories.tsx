import { ExternalLink, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

// TODO: Replace with actual API/RSS feed from commune-asia.com
const FEATURED_STORIES = [
  {
    id: 1,
    title: 'The Rise and Fall of Paradise Dynasty',
    excerpt: 'An in-depth analysis of how one of Singapore\'s most beloved dim sum chains lost its way in a competitive market.',
    url: 'https://commune-asia.com/burnt-end/paradise-dynasty',
    imageUrl: 'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=400&h=250&fit=crop',
    date: 'Mar 15, 2026',
    readTime: '12 min read'
  },
  {
    id: 2,
    title: 'When Expansion Kills: The Hawker Chain Story',
    excerpt: 'How rapid expansion and loss of quality control led to the downfall of a once-promising hawker franchise.',
    url: 'https://commune-asia.com/burnt-end/hawker-chain',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250&fit=crop',
    date: 'Feb 28, 2026',
    readTime: '10 min read'
  },
  {
    id: 3,
    title: 'The $2M Mistake: A Michelin-Starred Closure',
    excerpt: 'Inside the financial decisions that brought down a Michelin-starred restaurant in just 18 months.',
    url: 'https://commune-asia.com/burnt-end/michelin-mistake',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop',
    date: 'Jan 20, 2026',
    readTime: '15 min read'
  }
];

export function BurntEndStories() {
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
          {FEATURED_STORIES.map((story) => (
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
