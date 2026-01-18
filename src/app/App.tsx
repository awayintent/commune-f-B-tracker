import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { HeadlineCounter } from '@/app/components/HeadlineCounter';
import { RecentClosures } from '@/app/components/RecentClosures';
import { BurntEndStories } from '@/app/components/BurntEndStories';
import { MainTable } from '@/app/components/MainTable';
import { SubmissionCTA } from '@/app/components/SubmissionCTA';
import { EventsAndArticles } from '@/app/components/EventsAndArticles';

export default function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* 3-Column Layout */}
      <div className="flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {/* Left Column - Reserved for future advertisements */}
            <aside className="hidden lg:block lg:col-span-2 py-8">
              <div className="sticky top-4 bg-gray-50 rounded-lg p-4 text-center text-gray-400 border-2 border-dashed border-gray-300" style={{ minHeight: '400px' }}>
                <p className="text-sm mt-40">Ad Space</p>
              </div>
            </aside>

            {/* Center Column - Main Content */}
            <main className="col-span-12 lg:col-span-8">
              {/* Headline Counter */}
              <div className="mt-8 mb-8 -mx-4 md:mx-0 md:rounded-lg overflow-hidden shadow-lg">
                <HeadlineCounter />
              </div>

              {/* Recent Closures */}
              <div className="px-4 md:px-0">
                <RecentClosures />
              </div>

              {/* Burnt End Stories - Full width section */}
              <div className="-mx-4 md:-mx-[calc((100vw-1280px)/2+2rem)] lg:-mx-[calc((100vw-1280px)/2+2rem+8.33%+1rem)]">
                <BurntEndStories />
              </div>

              {/* Main Table */}
              <div className="px-4 md:px-0">
                <MainTable />
              </div>

              {/* Submission CTA */}
              <div className="px-4 md:px-0">
                <SubmissionCTA />
              </div>

              {/* Events and Articles */}
              <div className="px-4 md:px-0">
                <EventsAndArticles />
              </div>
            </main>

            {/* Right Column - Reserved for future advertisements */}
            <aside className="hidden lg:block lg:col-span-2 py-8">
              <div className="sticky top-4 bg-gray-50 rounded-lg p-4 text-center text-gray-400 border-2 border-dashed border-gray-300" style={{ minHeight: '400px' }}>
                <p className="text-sm mt-40">Ad Space</p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}