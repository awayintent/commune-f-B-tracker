import { Button } from '@/app/components/ui/button';
import { Mail, ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import { config } from '@/app/config/env';
import { useDataType } from '@/app/context/DataTypeContext';

export function Header() {
  const { dataType, setDataType } = useDataType();
  
  const handleSubscribe = () => {
    window.open(config.substackUrl, '_blank');
  };

  const handleSubmit = () => {
    window.open(config.googleFormUrl, '_blank');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-2xl font-bold text-[#0b3860]">
                SG F&B Tracker
              </div>
            </a>
            <span className="hidden md:inline text-sm text-gray-500 border-l pl-3 ml-3">
              by <span className="font-semibold text-[#0b3860]">COMMUNE</span>
            </span>
            
            {/* Global Toggle */}
            <div className="hidden lg:flex items-center gap-2 border-l pl-3 ml-3">
              <button
                onClick={() => setDataType('closures')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  dataType === 'closures'
                    ? 'bg-[#0b3860] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Closures
              </button>
              <button
                onClick={() => setDataType('openings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  dataType === 'openings'
                    ? 'bg-green-700 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Openings
              </button>
            </div>
          </div>

          {/* Navigation & CTAs */}
          <div className="flex items-center gap-3">
            {/* Submit CTA - Secondary */}
            <Button
              onClick={handleSubmit}
              variant="ghost"
              className="hidden sm:flex text-[#0b3860] hover:text-[#f5903e] hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Submit Info
            </Button>

            {/* Subscribe CTA - Primary */}
            <Button
              onClick={handleSubscribe}
              className="bg-[#f5903e] hover:bg-[#e07d2a] text-white font-semibold shadow-sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Subscribe</span>
              <span className="sm:hidden">Join</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}