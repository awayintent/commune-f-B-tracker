import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ExternalLink, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchClosures, formatDate } from '@/app/data/closures';
import type { Closure } from '@/app/data/types';

type SortField = 'business_name' | 'last_day' | 'added_at' | 'category';
type SortDirection = 'asc' | 'desc';

export function ClosuresTable() {
  const [closures, setClosures] = useState<Closure[]>([]);
  const [filteredClosures, setFilteredClosures] = useState<Closure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('last_day');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchClosures();
        setClosures(data);
        setFilteredClosures(data);
      } catch (error) {
        console.error('Error loading closures:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter closures based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClosures(closures);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = closures.filter(
      (closure) =>
        closure.business_name.toLowerCase().includes(term) ||
        closure.outlet_name.toLowerCase().includes(term) ||
        closure.address.toLowerCase().includes(term) ||
        closure.category.toLowerCase().includes(term) ||
        closure.description.toLowerCase().includes(term)
    );
    setFilteredClosures(filtered);
  }, [searchTerm, closures]);

  // Sort closures
  const sortedClosures = [...filteredClosures].sort((a, b) => {
    let aVal: string | Date = '';
    let bVal: string | Date = '';

    if (sortField === 'last_day' || sortField === 'added_at') {
      aVal = new Date(a[sortField] || '');
      bVal = new Date(b[sortField] || '');
    } else {
      aVal = a[sortField].toLowerCase();
      bVal = b[sortField].toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="w-full py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5903e] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading closures...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by name, location, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="text-gray-600"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {sortedClosures.length} of {closures.length} closures
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">
                  <button
                    onClick={() => handleSort('business_name')}
                    className="flex items-center hover:text-[#f5903e] transition-colors"
                  >
                    Business Name
                    <SortIcon field="business_name" />
                  </button>
                </TableHead>
                <TableHead className="font-semibold">Outlet</TableHead>
                <TableHead className="font-semibold">Address</TableHead>
                <TableHead className="font-semibold">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center hover:text-[#f5903e] transition-colors"
                  >
                    Category
                    <SortIcon field="category" />
                  </button>
                </TableHead>
                <TableHead className="font-semibold">
                  <button
                    onClick={() => handleSort('last_day')}
                    className="flex items-center hover:text-[#f5903e] transition-colors"
                  >
                    Last Day
                    <SortIcon field="last_day" />
                  </button>
                </TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold text-center">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClosures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No closures found matching your search.' : 'No closures recorded yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                sortedClosures.map((closure) => (
                  <TableRow key={closure.closure_id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{closure.business_name}</TableCell>
                    <TableCell className="text-gray-600">
                      {closure.outlet_name || '-'}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {closure.address || '-'}
                    </TableCell>
                    <TableCell>
                      {closure.category ? (
                        <Badge variant="secondary" className="bg-[#0b3860] text-white">
                          {closure.category}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {closure.last_day ? formatDate(closure.last_day) : '-'}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-md truncate">
                      {closure.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {closure.source_urls ? (
                        <a
                          href={closure.source_urls.split(',')[0].trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#f5903e] hover:text-[#e07d2a] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
