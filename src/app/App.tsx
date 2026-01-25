import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { HeadlineCounter } from '@/app/components/HeadlineCounter';
import { RecentClosures } from '@/app/components/RecentClosures';
import { RecentOpenings } from '@/app/components/RecentOpenings';
import { BurntEndStories } from '@/app/components/BurntEndStories';
import { MainTable } from '@/app/components/MainTable';
import { SubmissionCTA } from '@/app/components/SubmissionCTA';
import { EventsAndArticles } from '@/app/components/EventsAndArticles';

export default function App() {
  return (
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

            {/* Recent Closures */}
            <div className="px-4 md:px-0">
              <RecentClosures />
            </div>

            {/* Recent Openings */}
            <div className="px-4 md:px-0">
              <RecentOpenings />
            </div>

            {/* Main Table */}
            <div className="px-4 md:px-0">
              <MainTable />
            </div>

            {/* Submission CTA */}
            <div className="px-4 md:px-0">
              <SubmissionCTA />
            </div>

            {/* Burnt End Stories - Full width section */}
            <div className="-mx-4">
              <BurntEndStories />
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
  );
}