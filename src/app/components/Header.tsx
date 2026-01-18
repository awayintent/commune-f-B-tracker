import communeLogo from 'figma:asset/5e18ce48629e7cc4be8c2b9f12f2af1a415d4d1a.png';
import { Button } from '@/app/components/ui/button';
import { Mail } from 'lucide-react';
import { config } from '@/app/config/env';

export function Header() {
  const handleSubscribe = () => {
    window.open(config.substackUrl, '_blank');
  };

  return (
    <header className="border-b bg-[#0b3860]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <a 
            href="https://commune-asia.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
              Singapore F&B Closures Tracker
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">by</span>
              <img src={communeLogo} alt="Commune" className="h-6" />
            </div>
          </a>
          
          <Button 
            onClick={handleSubscribe}
            className="bg-[#f5903e] hover:bg-[#e07d2a] text-white font-semibold px-6 py-2 whitespace-nowrap"
          >
            <Mail className="w-4 h-4 mr-2" />
            Subscribe to Newsletter
          </Button>
        </div>
      </div>
    </header>
  );
}