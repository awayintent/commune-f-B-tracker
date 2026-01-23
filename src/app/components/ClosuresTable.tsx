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
import { ExternalLink, Search, ChevronUp, ChevronDown, Map, TableIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchClosures, formatDate } from '@/app/data/closures';
import type { Closure } from '@/app/data/types';
import { MapView } from './MapView';

type SortField = 'business_name' | 'last_day' | 'added_at' | 'category';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'map';

const ITEMS_PER_PAGE = 20;

export function ClosuresTable() {
  const [closures, setClosures] = useState<Closure[]>([]);
  const [filteredClosures, setFilteredClosures] = useState<Closure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('last_day');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);

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
      setCurrentPage(1); // Reset to first page
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
    setCurrentPage(1); // Reset to first page
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

  // Pagination
  const totalPages = Math.ceil(sortedClosures.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedClosures = sortedClosures.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {/* TODO: Add left/right ad spaces (160px each) when ready for monetization */}
      
      {/* Top Controls: Search + View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
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

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-white shadow-sm' : ''}
          >
            <TableIcon className="w-4 h-4 mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className={viewMode === 'map' ? 'bg-white shadow-sm' : ''}
          >
            <Map className="w-4 h-4 mr-2" />
            Map
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {viewMode === 'table' ? (
          <>
            Showing {startIndex + 1}-{Math.min(endIndex, sortedClosures.length)} of {sortedClosures.length} closures
            {sortedClosures.length !== closures.length && ` (filtered from ${closures.length})`}
          </>
        ) : (
          <>Showing {sortedClosures.length} closures on map</>
        )}
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <MapView closures={sortedClosures} />
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold w-[20%]">
                    <button
                      onClick={() => handleSort('business_name')}
                      className="flex items-center hover:text-[#f5903e] transition-colors"
                    >
                      Business Name
                      <SortIcon field="business_name" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold w-[25%]">Address</TableHead>
                  <TableHead className="font-semibold w-[12%]">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center hover:text-[#f5903e] transition-colors"
                    >
                      Category
                      <SortIcon field="category" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold w-[12%]">
                    <button
                      onClick={() => handleSort('last_day')}
                      className="flex items-center hover:text-[#f5903e] transition-colors"
                    >
                      Last Day
                      <SortIcon field="last_day" />
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold w-[28%]">Reason for Closure</TableHead>
                  <TableHead className="font-semibold text-center w-[3%]">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClosures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No closures found matching your search.' : 'No closures recorded yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClosures.map((closure) => (
                    <TableRow key={closure.closure_id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="line-clamp-2">
                          {closure.business_name}
                          {closure.outlet_name && <span className="text-sm text-gray-500 block">{closure.outlet_name}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="line-clamp-2">{closure.address || '-'}</div>
                      </TableCell>
                      <TableCell>
                        {closure.category ? (
                          <Badge variant="secondary" className="bg-[#0b3860] text-white whitespace-nowrap">
                            {closure.category}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap">
                        {closure.last_day ? formatDate(closure.last_day) : '-'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="line-clamp-2">{closure.description || '-'}</div>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
