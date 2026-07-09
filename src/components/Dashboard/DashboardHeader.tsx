import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-5 sm:mb-7">
      <div>
        <h1 className="text-[30px] font-bold">Dashboard</h1>
        <p className="text-[#64748B]">
          Overview of platform performance
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
