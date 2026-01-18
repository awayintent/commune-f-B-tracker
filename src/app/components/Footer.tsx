import { Button } from '@/app/components/ui/button';
import { Mail } from 'lucide-react';
import { config } from '@/app/config/env';

export function Footer() {
  const handleSubscribe = () => {
    window.open(config.substackUrl, '_blank');
  };

  return (
    <footer className="border-t bg-[#0b3860] mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column */}
          <div className="flex flex-col gap-3 text-left">
            <p className="text-gray-300">
              © 2026 Commune Asia. All rights reserved.
            </p>
            <p className="text-sm text-gray-400">
              Commune is a weekly newsletter covering the business and operational realities of the F&B industry in Singapore and Southeast Asia.
            </p>
            <a 
              href="https://commune-asia.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors underline"
            >
              Visit our homepage
            </a>
          </div>

          {/* Right Column */}
          <div className="flex justify-start md:justify-end">
            <Button 
              onClick={handleSubscribe}
              className="bg-[#f5903e] hover:bg-[#e07d2a] text-white font-semibold px-6 py-2 whitespace-nowrap"
            >
              <Mail className="w-4 h-4 mr-2" />
              Subscribe to Newsletter
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}