import React from 'react';
import { CheckCircle2 } from "lucide-react";

interface ResourcesDeletePopupProps {
  deleteSuccessPopup: { resourceName: string } | null;
}

const ResourcesDeletePopup: React.FC<ResourcesDeletePopupProps> = ({ deleteSuccessPopup }) => {
  if (!deleteSuccessPopup) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border border-green-200 bg-white p-4 shadow-lg">
        <div className="flex gap-3">
          <CheckCircle2 className="h-10 w-10 shrink-0 text-green-500" aria-hidden />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold text-gray-900">Deleted successfully</p>
            <p className="mt-1 text-gray-600">
              <span className="text-gray-500">Resource:</span>{' '}
              <span className="font-medium text-gray-900 break-words">
                {deleteSuccessPopup.resourceName}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesDeletePopup;
