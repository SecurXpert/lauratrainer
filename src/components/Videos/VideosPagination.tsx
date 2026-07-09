import React from 'react';
import { Button } from '@/components/ui/button';

interface VideosPaginationProps {
  currentPage: number;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
  totalPages: number;
  itemsPerPage: number;
  filteredVideosLength: number;
}

const VideosPagination: React.FC<VideosPaginationProps> = ({
  currentPage, setCurrentPage, totalPages, itemsPerPage, filteredVideosLength
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
        <span className="font-medium">
          {Math.min(currentPage * itemsPerPage, filteredVideosLength)}
        </span>{' '}
        of <span className="font-medium">{filteredVideosLength}</span> videos
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(typeof prev === 'number' ? prev - 1 : currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(typeof prev === 'number' ? prev + 1 : currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default VideosPagination;
