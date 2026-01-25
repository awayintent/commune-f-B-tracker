import { Button } from '@/app/components/ui/button';
import { FileEdit } from 'lucide-react';
import { config } from '@/app/config/env';

export function SubmissionCTA() {
  const handleSubmit = () => {
    window.open(config.googleFormUrl, '_blank');
  };

  return (
    <section className="py-12">
      <div className="bg-gradient-to-r from-[#0b3860] to-[#072a47] rounded-lg p-8 text-center shadow-lg">
        <p className="text-xl md:text-2xl mb-4 text-white font-semibold">
          Know of an F&B closure or opening we missed?
        </p>
        <Button 
          onClick={handleSubmit}
          size="lg"
          className="bg-[#f5903e] hover:bg-[#e07d2a] text-white border-2 border-[#f5903e] hover:border-[#e07d2a] transition-all"
        >
          <FileEdit className="w-5 h-5 mr-2" />
          Submit Information
        </Button>
        <p className="text-sm text-gray-300 mt-3">
          Help us keep this database accurate and up-to-date
        </p>
      </div>
    </section>
  );
}