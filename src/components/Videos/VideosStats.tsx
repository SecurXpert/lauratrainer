import React from 'react';

interface VideosStatsProps {
  videosCount: number;
  loading: boolean;
  displayStorage: string;
}

const VideosStats: React.FC<VideosStatsProps> = ({ videosCount, loading, displayStorage }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-[20px] p-6 shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
        <p className="text-[14.5px] font-medium text-[#6A7282] mb-1.5">Total Videos</p>
        {loading ? (
          <div className="h-[30px] w-16 bg-slate-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-[30px] font-bold text-[#101828] leading-none tracking-tight">{videosCount}</p>
        )}
      </div>
      <div className="bg-white rounded-[20px] p-6 shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
        <p className="text-[14.5px] font-medium text-[#6A7282] mb-1.5">Storage Used</p>
        {loading ? (
          <div className="h-[30px] w-24 bg-slate-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-[30px] font-bold text-[#00A63E] leading-none tracking-tight">{displayStorage}</p>
        )}
      </div>
    </div>
  );
};

export default VideosStats;
