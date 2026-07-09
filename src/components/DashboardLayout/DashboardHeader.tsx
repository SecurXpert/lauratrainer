import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { IoPersonSharp } from "react-icons/io5";
import { menuSections } from "./DashboardMenuSections";

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  profileLoading: boolean;
  profileData: any;
  setProfileModalOpen: (open: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  profileLoading,
  profileData,
  setProfileModalOpen,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full px-6 md:px-10 pt-5 pb-2.5 bg-transparent relative z-30">
      <div className="w-full max-w-[1180px] mx-auto flex items-center justify-between">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">

          {/* ☰ MENU BUTTON */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md bg-white shadow-sm shrink-0 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* SEARCH */}
          <div ref={searchContainerRef} className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const alphabeticValue = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                const limitedValue = alphabeticValue.slice(0, 15);
                setSearchQuery(limitedValue);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim().length > 0) {
                  const query = searchQuery.toLowerCase();
                  const items = [
                    ...menuSections.flatMap(section => section.items),
                    { path: "/profile", label: "Profile", icon: IoPersonSharp }
                  ];
                  const results = items.filter(item => item.label.toLowerCase().includes(query));
                  if (results.length > 0) {
                    if (results[0].path === "/profile") {
                      setProfileModalOpen(true);
                    } else {
                      setProfileModalOpen(false);
                      navigate(results[0].path);
                    }
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }
                }
              }}
              placeholder="Search courses, assessments, or pages..."
              maxLength={15}
              className="w-full bg-white text-gray-800 placeholder-gray-400 text-xs rounded-full pl-9 pr-4 py-2.5 outline-none shadow-sm border border-gray-100/50 focus:border-[#5D3EFC] transition-all"
            />

            {/* Dropdown Results */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full max-h-[400px] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 custom-scrollbar">
                {(() => {
                  const query = searchQuery.toLowerCase();
                  const itemsWithProfile = [
                    ...menuSections.flatMap(section =>
                      section.items.map(item => ({ ...item, section: section.title }))
                    ),
                    { path: "/profile", label: "Profile", icon: IoPersonSharp, section: "Account" }
                  ];
                  const results = itemsWithProfile.filter(item =>
                    item.label.toLowerCase().includes(query)
                  );

                  if (results.length === 0) {
                    return (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No results found for "{searchQuery}"
                      </div>
                    );
                  }

                  return (
                    <div className="px-2">
                      {results.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (item.path === "/profile") {
                              setProfileModalOpen(true);
                            } else {
                              setProfileModalOpen(false);
                              navigate(item.path);
                            }
                            setSearchQuery("");
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 group-hover:text-[#5D3EFC] transition-colors">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-[#5D3EFC] transition-colors">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
                              {item.section}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {/* USER */}
          {profileLoading && !profileData ? (
            <div className="flex items-center gap-3 select-none">
              <div className="text-right hidden sm:block">
                <div className="h-3 w-16 bg-slate-200 animate-pulse rounded"></div>
                <div className="h-2 w-10 bg-slate-100 animate-pulse rounded mt-1.5 ml-auto"></div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse shadow-sm"></div>
            </div>
          ) : (
            <div
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-3 cursor-pointer group select-none"
              title="Go to Profile"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#5D3EFC] transition-colors">
                  {profileData?.name || "Trainer"}
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {profileData?.role || profileData?.role_name || "Instructor"}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#5D3EFC] flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-md shadow-[#5D3EFC]/25 group-hover:scale-105 transition-transform">
                {profileData?.name
                  ? profileData.name
                    .split(" ")
                    .map((word: string) => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                  : "TR"}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
