import React from 'react';

interface CourseMaterialsMetricsProps {
  selectedCourseId: string;
  totalMaterialCount: number;
  materialsLength: number;
  totalDocumentsCount: number;
}

const CourseMaterialsMetrics: React.FC<CourseMaterialsMetricsProps> = ({
  selectedCourseId,
  totalMaterialCount,
  materialsLength,
  totalDocumentsCount
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-[20px] shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
        <p className="text-[13px] text-gray-500 font-medium mb-1">Total Courses</p>
        <h3 className="text-3xl font-bold text-[#0F172A]">{selectedCourseId ? 1 : totalMaterialCount}</h3>
      </div>
      <div className="bg-white p-6 rounded-[20px] shadow-md border border-gray-200 flex flex-col min-h-[120px] justify-center">
        <p className="text-[13px] text-gray-500 font-medium mb-1">Documents</p>
        <h3 className="text-3xl font-bold text-[#2563EB]">{selectedCourseId ? materialsLength : totalDocumentsCount}</h3>
      </div>
    </div>
  );
};

export default CourseMaterialsMetrics;
