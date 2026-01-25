import { useState, useEffect } from 'react';
import { TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { fetchOpenings, getRecentOpenings, formatDate } from '@/app/data/openings';
import type { Opening } from '@/app/data/types';

export function RecentOpenings() {
  const [recentOpenings, setRecentOpenings] = useState<Opening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const openings = await fetchOpenings();
        const recent = getRecentOpenings(openings, 3);
        setRecentOpenings(recent);
      } catch (error) {
        console.error('Error loading recent openings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-green-700">New Openings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-green-600/20 animate-pulse">
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

  if (recentOpenings.length === 0) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-green-700">New Openings</h2>
        <p className="text-center text-gray-600">No openings data available yet.</p>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-green-700">New Openings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentOpenings.map((opening) => {
          // Use image_url if available, otherwise fallback to placeholder
          const backgroundImage = opening.image_url 
            ? `linear-gradient(rgba(22, 101, 52, 0.5), rgba(22, 101, 52, 0.5)), url('${opening.image_url}')`
            : `linear-gradient(rgba(22, 101, 52, 0.5), rgba(22, 101, 52, 0.5)), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop')`;
          
          return (
            <Card key={opening.opening_id} className="hover:shadow-lg transition-shadow border-green-600/20 overflow-hidden">
              {/* Header with background image - 50% opacity overlay */}
              <CardHeader 
                className="relative items-center min-h-[120px] flex justify-center bg-cover bg-center"
                style={{
                  backgroundImage
                }}
              >
                <CardTitle className="text-xl text-white text-center z-10 drop-shadow-lg">
                  {opening.business_name}
                </CardTitle>
              </CardHeader>
            <CardContent className="pt-4 bg-white">
              <div className="space-y-2">
                {opening.category && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-green-700">Type:</span> {opening.category}
                  </p>
                )}
                {opening.address && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="line-clamp-1">{opening.address}</span>
                  </p>
                )}
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>{formatDate(opening.opening_date || opening.added_at)}</span>
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
