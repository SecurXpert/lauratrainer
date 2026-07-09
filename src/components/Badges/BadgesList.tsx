import { FaMedal } from "react-icons/fa";
import { Badge } from "./Types";

interface Props {
  badges: Badge[];
  loading: boolean;
  searchQuery: string;
  filterStatus: string;
  filterDate: string;
  currentPage: number;
  setCurrentPage: (p: number | ((prev: number) => number)) => void;
}

export const BadgesList = ({ badges, loading, searchQuery, filterStatus, filterDate, currentPage, setCurrentPage }: Props) => {
  const itemsPerPage = 8;
  
  if (loading) return <div className="text-center py-12"><p className="text-gray-500 text-base sm:text-lg">Loading badges...</p></div>;
  if (!loading && badges.length === 0) return <div className="text-center py-12 text-gray-500">No badges found.</div>;

  const filteredBadges = badges.filter((badge) => {
    if (searchQuery && !badge.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus === "Active" && !badge.is_active) return false;
    if (filterStatus === "Inactive" && badge.is_active) return false;
    if (filterDate && badge.created_at && !badge.created_at.startsWith(filterDate)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredBadges.length / itemsPerPage) || 1;
  const paginatedBadges = filteredBadges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const badgeGradients = [
    "from-amber-400 to-orange-500 shadow-[0_4px_14px_rgba(245,158,11,0.25)]", 
    "from-emerald-400 to-teal-500 shadow-[0_4px_14px_rgba(16,185,129,0.25)]", 
    "from-cyan-400 to-blue-500 shadow-[0_4px_14px_rgba(6,182,212,0.25)]", 
    "from-fuchsia-400 to-purple-500 shadow-[0_4px_14px_rgba(217,70,239,0.25)]", 
    "from-rose-400 to-red-500 shadow-[0_4px_14px_rgba(244,63,94,0.25)]", 
    "from-indigo-400 to-violet-500 shadow-[0_4px_14px_rgba(99,102,241,0.25)]", 
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {paginatedBadges.map((badge, index) => {
          const bgGradient = badgeGradients[index % badgeGradients.length];
          return (
            <div key={badge.id} className="bg-white border border-slate-100 rounded-[20px] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center text-center group">
              <div className={`w-20 h-20 rounded-[18px] bg-gradient-to-b ${bgGradient} flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform duration-300 shrink-0`}>
                {badge.icon_url ? (
                  <img src={badge.icon_url} alt={badge.name} className="w-10 h-10 object-contain drop-shadow-md" />
                ) : (
                  <FaMedal className="text-4xl drop-shadow-md opacity-90" />
                )}
              </div>
              <h3 className="text-[17px] font-bold text-[#111827] mb-1.5 line-clamp-1">{badge.name}</h3>
              <p className="text-[13.5px] text-[#6B7280] font-medium mb-6 h-[40px] overflow-hidden leading-[20px] break-all">{badge.description || "No description"}</p>
              <div className={`mt-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full border ${badge.is_active ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <div className={`w-2 h-2 rounded-full ${badge.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                <span className={`text-[12px] font-bold tracking-wide uppercase ${badge.is_active ? 'text-emerald-700' : 'text-rose-600'}`}>{badge.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p as number - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">Previous</button>
          <span className="text-sm font-medium text-gray-600 px-4">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p as number + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">Next</button>
        </div>
      )}
    </>
  );
};
