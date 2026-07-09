import { FaAward } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Certificate } from "./Types";

interface Props {
  selectedCert: Certificate | null;
  setSelectedCert: (val: Certificate | null) => void;
  handleDownload: (name: string) => void;
}

export const CertificateModal = ({ selectedCert, setSelectedCert, handleDownload }: Props) => {
  if (!selectedCert) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 p-4 sm:p-6 overflow-y-auto flex flex-col">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 sm:p-5 w-full max-w-3xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col my-auto mx-auto shrink-0">
        <div className="flex items-start sm:items-center justify-between mb-3 shrink-0 gap-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1 sm:mt-0">
            Certificate Preview - <span className="break-words">{selectedCert.name}</span>
          </h3>
          <button onClick={() => setSelectedCert(null)} className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8 text-center shadow-sm shrink-0">
          <FaAward className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-2 sm:mb-3 drop-shadow-sm" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight leading-tight">Certificate of Completion</h2>
          <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 font-medium leading-tight">This is to certify that</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 break-words leading-tight">{selectedCert.name}</p>
          <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 font-medium leading-tight">has successfully completed</p>
          <p className="text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5 break-words leading-tight">{selectedCert.courseId}</p>
          
          <div className="border-t border-gray-200 pt-3 sm:pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="bg-white/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                <p className="text-gray-500 mb-0.5 font-medium">Issue Date</p>
                <p className="font-bold text-gray-900">{selectedCert.date}</p>
              </div>
              <div className="bg-white/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                <p className="text-gray-500 mb-0.5 font-medium">Student ID</p>
                <p className="font-bold text-gray-900 break-words">{selectedCert.studentId}</p>
              </div>
              <div className="bg-white/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                <p className="text-gray-500 mb-0.5 font-medium">Certificate No</p>
                <p className="font-bold text-gray-900 break-words">{selectedCert.certificateNo}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={() => setSelectedCert(null)} className="w-full sm:w-auto h-9 sm:h-10 px-6 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 border-gray-200 text-sm">Close</Button>
          {selectedCert.download_url ? (
            <Button className="w-full sm:w-auto h-9 sm:h-10 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md border-0 text-sm" onClick={() => window.open(selectedCert.download_url, "_blank")}>
              <FiDownload className="mr-2 h-3.5 w-3.5" /> Download PDF
            </Button>
          ) : (
            <Button className="w-full sm:w-auto h-9 sm:h-10 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md border-0 text-sm" onClick={() => handleDownload(selectedCert.name)}>
              <FiDownload className="mr-2 h-3.5 w-3.5" /> Download PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
