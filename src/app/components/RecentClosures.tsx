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
        {recentClosures.map((closure) => (
          <Card key={closure.closure_id} className="hover:shadow-lg transition-shadow border-[#0b3860]/20">
            <CardHeader className="bg-[#0b3860] items-center min-h-[80px] flex justify-center">
              <CardTitle className="text-xl text-white text-center">
                {closure.business_name}
                {closure.outlet_name && ` - ${closure.outlet_name}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
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
                {closure.status === 'Confirmed' && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Confirmed
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}