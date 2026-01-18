import { Button } from '@/app/components/ui/button';
import { Mail, ExternalLink } from 'lucide-react';
import { config } from '@/app/config/env';

export function Footer() {
  const handleSubscribe = () => {
    window.open(config.substackUrl, '_blank');
  };

  const handleSubmit = () => {
    window.open(config.googleFormUrl, '_blank');
  };

  return (
    <footer className="border-t bg-gray-50 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-[#0b3860] mb-3">
              Singapore F&B Closures Tracker
            </h3>
            <Button 
              onClick={handleSubscribe}
              className="bg-[#f5903e] hover:bg-[#e07d2a] text-white font-semibold"
            >
              <Mail className="w-4 h-4 mr-2" />
              Subscribe to Newsletter
            </Button>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="font-semibold text-[#0b3860] mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={handleSubmit}
                  className="text-gray-600 hover:text-[#f5903e] transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Submit a Closure
                </button>
              </li>
              <li>
                <a
                  href="https://commune-asia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#f5903e] transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit COMMUNE
                </a>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h4 className="font-semibold text-[#0b3860] mb-3">About</h4>
            <p className="text-sm text-gray-600">
              Commune is a weekly newsletter covering the business and operational realities of the F&B industry in Southeast Asia.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Commune Asia. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://commune-asia.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-[#f5903e] transition-colors">
              Privacy
            </a>
            <a href="https://commune-asia.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-[#f5903e] transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}