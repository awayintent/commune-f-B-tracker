import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Calendar } from 'lucide-react';
import { fetchClosures, getMonthlyCounts, getAvailableYears } from '@/app/data/closures';
import { fetchOpenings, getMonthlyOpeningCounts, getAvailableYears as getAvailableOpeningYears } from '@/app/data/openings';
import type { MonthlyCounts } from '@/app/data/types';
import { useDataType } from '@/app/context/DataTypeContext';

export function HeadlineCounter() {
  const { dataType } = useDataType();
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [count, setCount] = useState(0);
  const [closureData, setClosureData] = useState<MonthlyCounts>({});
  const [openingData, setOpeningData] = useState<MonthlyCounts>({});
  const [years, setYears] = useState<string[]>(['2024', '2025', '2026']);
  const [loading, setLoading] = useState(true);

  // Load both closures and openings data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [closures, openings] = await Promise.all([
          fetchClosures(),
          fetchOpenings()
        ]);
        
        const closureCounts = getMonthlyCounts(closures);
        const openingCounts = getMonthlyOpeningCounts(openings);
        const closureYears = getAvailableYears(closures);
        const openingYears = getAvailableOpeningYears(openings);
        
        // Combine years from both datasets
        const allYears = Array.from(new Set([...closureYears, ...openingYears])).sort().reverse();
        
        setClosureData(closureCounts);
        setOpeningData(openingCounts);
        
        if (allYears.length > 0) {
          setYears(allYears);
          setSelectedYear(allYears[0]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Get data key based on selections
  const getDataKey = () => {
    if (selectedMonth) {
      return `${selectedYear}-${selectedMonth}`;
    }
    return selectedYear;
  };

  // Animated counter effect
  useEffect(() => {
    const dataKey = getDataKey();
    const currentData = dataType === 'closures' ? closureData : openingData;
    const target = currentData[dataKey] || 0;
    let current = 0;
    const increment = Math.ceil(target / 30);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [selectedYear, selectedMonth, dataType, closureData, openingData]);

  const getPeriodText = () => {
    if (selectedMonth) {
      const monthObj = months.find(m => m.value === selectedMonth);
      return `${monthObj?.label} ${selectedYear}`;
    }
    return selectedYear;
  };

  const handleApply = () => {
    setOpen(false);
  };

  const handleClearMonth = () => {
    setSelectedMonth('');
  };

  return (
    <div className="bg-gradient-to-br from-[#0b3860] to-[#072a47] text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className={`text-5xl md:text-7xl font-bold mb-4 ${
          dataType === 'closures' ? 'text-red-400' : 'text-green-400'
        }`}>
          {loading ? '...' : count}
        </h2>
        <p className="text-xl md:text-3xl mb-2">
          F&B Businesses {dataType === 'closures' ? 'Closed' : 'Opened'} in{' '}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className={`underline decoration-2 hover:decoration-4 transition-all cursor-pointer inline items-baseline gap-2 text-xl md:text-3xl ${
                dataType === 'closures' ? 'text-red-400' : 'text-green-400'
              }`}>
                {getPeriodText()}
                <Calendar className="w-5 h-5 md:w-6 md:h-6 inline align-text-bottom" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Time Period</DialogTitle>
                <DialogDescription>
                  Choose a year and optionally a month to view {dataType === 'closures' ? 'closure' : 'opening'} statistics
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="year" className="text-sm font-medium">
                    Year
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="month" className="text-sm font-medium">
                      Month (Optional)
                    </label>
                    {selectedMonth && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearMonth}
                        className="h-auto p-0 text-xs text-[#f5903e] hover:text-[#e07d2a]"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Select month (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleApply} 
                  className={`w-full text-white ${
                    dataType === 'closures' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Apply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </p>
        <p className="text-sm opacity-90 mt-4">Click the date to change time period</p>
      </div>
    </div>
  );
}