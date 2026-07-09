import React from 'react';

interface ResourcesStatsProps {
  totalResourcesCount: number;
  totalFilesCount: number;
}

const ResourcesStats: React.FC<ResourcesStatsProps> = ({ totalResourcesCount, totalFilesCount }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-[20px] shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
        <p className="text-[13px] text-gray-500 font-medium mb-1">Total Resources</p>
        <h3 className="text-3xl font-bold text-[#0F172A]">{totalResourcesCount}</h3>
      </div>
      <div className="bg-white p-6 rounded-[20px] shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
        <p className="text-[13px] text-gray-500 font-medium mb-1">Total Files</p>
        <h3 className="text-3xl font-bold text-[#2563EB]">{totalFilesCount}</h3>
      </div>
    </div>
  );
};

export default ResourcesStats;
