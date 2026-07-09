import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface VideosHeaderProps {
  setShowUploadForm: (val: boolean) => void;
}

const VideosHeader: React.FC<VideosHeaderProps> = ({ setShowUploadForm }) => {
  return (
    <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-md py-4 -mt-2 md:-mt-3 mb-5 sm:mb-7 border-b border-gray-200/80 px-4 -mx-2 md:-mx-3 md:px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[30px] font-bold">Recorded Videos</h1>
        <p className="text-[#64748B]">
          Manage your course video library
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => setShowUploadForm(true)}
          className="bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:from-[#2563EB] hover:to-[#6D28D9] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload New Video
        </Button>
      </div>
    </div>
  );
};

export default VideosHeader;
