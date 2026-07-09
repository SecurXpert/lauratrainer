import { FaEye, FaAward } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { Certificate } from "./Types";

interface Props {
  filteredCerts: Certificate[];
  setSelectedCert: (cert: Certificate) => void;
  handleDownload: (name: string) => void;
}

export const CertificatesList = ({ filteredCerts, setSelectedCert, handleDownload }: Props) => {
  return (
    <>
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-900">
                <th className="py-5 px-6 font-semibold">Student</th>
                <th className="py-5 px-6 font-semibold">Student ID</th>
                <th className="py-5 px-6 font-semibold">Course ID</th>
                <th className="py-5 px-6 font-semibold">Certificate No</th>
                <th className="py-5 px-6 font-semibold">Issue Date</th>
                <th className="py-5 px-6 font-semibold">Status</th>
                <th className="py-5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCerts.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">No certificates found.</td></tr>
              ) : (
                filteredCerts.map((row, idx) => (
                  <tr key={`${row.studentId}-${idx}`}>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">{row.initials}</div>
                        <span className="font-medium text-gray-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-gray-600 font-mono">{row.studentId}</td>
                    <td className="py-5 px-6 text-gray-600 font-mono">{row.courseId}</td>
                    <td className="py-5 px-6 font-bold text-gray-700">{row.certificateNo}</td>
                    <td className="py-5 px-6 text-gray-600">{row.date}</td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${row.status === "Issued" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-500"}`}>{row.status}</span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {row.status === "Issued" ? (
                          <>
                            <button onClick={() => setSelectedCert(row)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm hover:bg-blue-100">
                              <FaEye className="h-3.5 w-3.5" /> View
                            </button>
                            {row.download_url ? (
                              <a href={row.download_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-gray-700"><FiDownload className="h-4 w-4 text-gray-800" /></a>
                            ) : (
                              <button onClick={() => handleDownload(row.name)} className="p-2 text-gray-500 hover:text-gray-700"><FiDownload className="h-4 w-4 text-gray-800" /></button>
                            )}
                          </>
                        ) : (
                          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm hover:from-blue-700 hover:to-purple-700">
                            <FaAward className="h-3.5 w-3.5" /> Issue
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3 mb-8">
        {filteredCerts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-gray-500">No certificates found.</div>
        ) : (
          filteredCerts.map((row, idx) => (
            <div key={`${row.studentId}-${idx}`} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">{row.initials}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{row.name}</p>
                    <p className="text-xs text-gray-500 truncate">{row.studentId}</p>
                  </div>
                </div>
                <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${row.status === "Issued" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-500"}`}>{row.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div><p className="text-gray-400">Course ID</p><p className="font-medium text-gray-700 break-words">{row.courseId}</p></div>
                <div><p className="text-gray-400">Certificate No</p><p className="font-bold text-gray-700">{row.certificateNo}</p></div>
                <div><p className="text-gray-400">Issue Date</p><p className="font-medium text-gray-700">{row.date}</p></div>
                <div>
                  <p className="text-gray-400">Action</p>
                  {row.status === "Issued" ? (
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => setSelectedCert(row)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs hover:bg-blue-100"><FaEye className="h-3.5 w-3.5" /> View</button>
                      {row.download_url ? (
                        <a href={row.download_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-500 hover:text-gray-700"><FiDownload className="h-4 w-4" /></a>
                      ) : (
                        <button onClick={() => handleDownload(row.name)} className="p-1.5 text-gray-500 hover:text-gray-700"><FiDownload className="h-4 w-4" /></button>
                      )}
                    </div>
                  ) : (
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs mt-1"><FaAward className="h-3.5 w-3.5" /> Issue</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
