import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { HeadlineCounter } from '@/app/components/HeadlineCounter';
import { RecentBusinesses } from '@/app/components/RecentBusinesses';
import { LatestStories } from '@/app/components/LatestStories';
import { MainTable } from '@/app/components/MainTable';
import { SubmissionCTA } from '@/app/components/SubmissionCTA';
import { EventsAndArticles } from '@/app/components/EventsAndArticles';
import { DataTypeProvider } from '@/app/context/DataTypeContext';

export default function App() {
  return (
    <DataTypeProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
      
      {/* Main Content - Full Width */}
      <div className="flex-1">
        <div className="container mx-auto px-4">
          <main className="w-full">
            {/* Headline Counter */}
            <div className="mt-8 mb-8 -mx-4 md:mx-0 md:rounded-lg overflow-hidden shadow-lg">
              <HeadlineCounter />
            </div>

            {/* Recent Businesses (Closures/Openings Toggle) */}
            <div className="px-4 md:px-0">
              <RecentBusinesses />
            </div>

            {/* Main Table (Closures/Openings Toggle) */}
            <div className="px-4 md:px-0">
              <MainTable />
            </div>

            {/* Submission CTA */}
            <div className="px-4 md:px-0">
              <SubmissionCTA />
            </div>

            {/* Latest Stories - Full width section */}
            <div className="-mx-4">
              <LatestStories />
            </div>

            {/* Events and Articles */}
            <div className="px-4 md:px-0">
              <EventsAndArticles />
            </div>
          </main>
        </div>
      </div>

      <Footer />
      </div>
    </DataTypeProvider>
  );
}