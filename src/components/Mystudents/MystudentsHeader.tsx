import React from 'react';

const MystudentsHeader: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Student Records</h1>
      <p className="text-base text-gray-500 mt-1">
        View and manage student profiles and performance
      </p>
    </div>
  );
};

export default MystudentsHeader;
