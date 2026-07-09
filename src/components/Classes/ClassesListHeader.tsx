import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ClassesListHeaderProps {
  filteredClassesCount: number;
  currentPage: number;
  itemsPerPage: number;
  sortBy: string;
  setSortBy: (s: string) => void;
}

export const ClassesListHeader: React.FC<ClassesListHeaderProps> = ({
  filteredClassesCount, currentPage, itemsPerPage, sortBy, setSortBy
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
      <p className="text-sm text-gray-500">
        Showing {filteredClassesCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(filteredClassesCount, currentPage * itemsPerPage)} of {filteredClassesCount} classes
      </p>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm text-gray-500 whitespace-nowrap">Sort by</span>
        <div className="relative w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-gray-200 appearance-none bg-white cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
