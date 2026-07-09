import { FiAward } from "react-icons/fi";
import { LuFileCheck } from "react-icons/lu";

interface Props {
  totalCertificates: number;
  thisMonthCertificatesCount: number;
}

export const CertificatesHeader = ({ totalCertificates, thisMonthCertificatesCount }: Props) => {
  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Certificates
          </h1>
        </div>
        <p className="text-gray-500 text-base">
          Manage and issue course certificates
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white shadow-md border border-gray-200 rounded-[20px] px-5 py-6 flex items-start justify-between min-h-[118px]">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 mb-1.5 font-medium">Total Issued</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-900">{totalCertificates.toLocaleString()}</p>
          </div>
          <FiAward className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0 mt-0.5" />
        </div>

        <div className="bg-white shadow-md border border-gray-200 rounded-[20px] px-5 py-6 flex items-start justify-between min-h-[118px]">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 mb-1.5 font-medium">This Month</p>
            <p className="text-xl sm:text-3xl font-bold text-green-600">{thisMonthCertificatesCount.toLocaleString()}</p>
          </div>
          <LuFileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0 mt-0.5" />
        </div>
      </div>
    </>
  );
};
