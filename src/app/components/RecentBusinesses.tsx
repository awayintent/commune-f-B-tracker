import { useState, useEffect } from 'react';
import { Clock, MapPin, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { fetchClosures, getRecentClosures, formatDate as formatClosureDate } from '@/app/data/closures';
import { fetchOpenings, getRecentOpenings, formatDate as formatOpeningDate } from '@/app/data/openings';
import type { Closure, Opening } from '@/app/data/types';
import { useDataType } from '@/app/context/DataTypeContext';

export function RecentBusinesses() {
  const { dataType } = useDataType();
  const [recentClosures, setRecentClosures] = useState<Closure[]>([]);
  const [recentOpenings, setRecentOpenings] = useState<Opening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [closures, openings] = await Promise.all([
          fetchClosures(),
          fetchOpenings()
        ]);
        const recentC = getRecentClosures(closures, 3);
        const recentO = getRecentOpenings(openings, 3);
        setRecentClosures(recentC);
        setRecentOpenings(recentO);
      } catch (error) {
        console.error('Error loading recent businesses:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const currentData = dataType === 'closures' ? recentClosures : recentOpenings;
  const hasData = currentData.length > 0;

  if (loading) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#0b3860]">
          Most Recent {dataType === 'closures' ? 'Closures' : 'Openings'}
        </h2>
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

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0b3860]">
        Most Recent {dataType === 'closures' ? 'Closures' : 'Openings'}
      </h2>

      {!hasData ? (
        <p className="text-center text-gray-600">
          No {dataType === 'closures' ? 'closures' : 'openings'} data available yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dataType === 'closures'
            ? recentClosures.map((closure) => {
                const backgroundImage = closure.image_url
                  ? `linear-gradient(rgba(185, 28, 28, 0.5), rgba(185, 28, 28, 0.5)), url('${closure.image_url}')`
                  : `linear-gradient(rgba(185, 28, 28, 0.5), rgba(185, 28, 28, 0.5)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop')`;

                return (
                  <Card
                    key={closure.closure_id}
                    className="hover:shadow-lg transition-shadow border-red-600/20 overflow-hidden"
                  >
                    <CardHeader
                      className="relative items-center min-h-[120px] flex justify-center bg-cover bg-center"
                      style={{ backgroundImage }}
                    >
                      <CardTitle className="text-xl text-white text-center z-10 drop-shadow-lg">
                        {closure.business_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 bg-white">
                      <div className="space-y-2">
                        {closure.category && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-red-700">Type:</span> {closure.category}
                          </p>
                        )}
                        {closure.address && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="line-clamp-1">{closure.address}</span>
                          </p>
                        )}
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-600" />
                          <span>{formatClosureDate(closure.last_day || closure.added_at)}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            : recentOpenings.map((opening) => {
                const backgroundImage = opening.image_url
                  ? `linear-gradient(rgba(22, 101, 52, 0.5), rgba(22, 101, 52, 0.5)), url('${opening.image_url}')`
                  : `linear-gradient(rgba(22, 101, 52, 0.5), rgba(22, 101, 52, 0.5)), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop')`;

                return (
                  <Card
                    key={opening.opening_id}
                    className="hover:shadow-lg transition-shadow border-green-600/20 overflow-hidden"
                  >
                    <CardHeader
                      className="relative items-center min-h-[120px] flex justify-center bg-cover bg-center"
                      style={{ backgroundImage }}
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
                          <span>{formatOpeningDate(opening.opening_date || opening.added_at)}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      )}
    </section>
  );
}
