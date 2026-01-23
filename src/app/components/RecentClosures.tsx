import { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { fetchClosures, getRecentClosures, formatDate } from '@/app/data/closures';
import type { Closure } from '@/app/data/types';

export function RecentClosures() {
  const [recentClosures, setRecentClosures] = useState<Closure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const closures = await fetchClosures();
        const recent = getRecentClosures(closures, 3);
        setRecentClosures(recent);
      } catch (error) {
        console.error('Error loading recent closures:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#0b3860]">Most Recent Closures</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-[#0b3860]/20 animate-pulse">
              <CardHeader className="bg-gray-200 min-h-[80px]">
                <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (recentClosures.length === 0) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#0b3860]">Most Recent Closures</h2>
        <p className="text-center text-gray-600">No closures data available yet.</p>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0b3860]">Most Recent Closures</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentClosures.map((closure) => {
          // Use image_url if available, otherwise fallback to placeholder
          const backgroundImage = closure.image_url 
            ? `linear-gradient(rgba(11, 56, 96, 0.5), rgba(11, 56, 96, 0.5)), url('${closure.image_url}')`
            : `linear-gradient(rgba(11, 56, 96, 0.5), rgba(11, 56, 96, 0.5)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop')`;
          
          return (
            <Card key={closure.closure_id} className="hover:shadow-lg transition-shadow border-[#0b3860]/20 overflow-hidden">
              {/* Header with background image - 50% opacity overlay */}
              <CardHeader 
                className="relative items-center min-h-[120px] flex justify-center bg-cover bg-center"
                style={{
                  backgroundImage
                }}
              >
                <CardTitle className="text-xl text-white text-center z-10 drop-shadow-lg">
                  {closure.business_name}
                </CardTitle>
              </CardHeader>
            <CardContent className="pt-4 bg-white">
              <div className="space-y-2">
                {closure.category && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-[#0b3860]">Type:</span> {closure.category}
                  </p>
                )}
                {closure.address && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#f5903e]" />
                    <span className="line-clamp-1">{closure.address}</span>
                  </p>
                )}
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#f5903e]" />
                  <span>{formatDate(closure.last_day || closure.added_at)}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>
    </section>
  );
}