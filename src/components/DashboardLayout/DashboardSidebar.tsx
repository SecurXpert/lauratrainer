import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/lauratek.png";
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { IoPersonSharp } from "react-icons/io5";
import { LogOut } from "lucide-react";
import { menuSections } from "./DashboardMenuSections";

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  handleLogout: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  profileModalOpen,
  setProfileModalOpen,
  handleLogout,
}) => {
  const location = useLocation();

  return (
    <>
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-50 shrink-0 flex flex-col select-none bg-white md:rounded-[24px] md:m-5 md:h-[calc(100vh-40px)] border-r border-slate-100 md:border md:border-gray-100/50 shadow-lg transition-all duration-300 ease-in-out",
          isSidebarOpen
            ? "translate-x-0 w-[230px] md:w-64"
            : "-translate-x-full md:translate-x-0 md:w-16"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "pt-6 pb-4 flex items-center justify-between px-4 relative transition-all duration-300",
          !isSidebarOpen && "flex-col gap-4 px-2 justify-center"
        )}>
          {!isSidebarOpen ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:bg-gray-100 h-10 w-10 flex items-center justify-center rounded-lg transition-colors"
                aria-label="Expand Sidebar"
              >
                <MdKeyboardDoubleArrowRight className="w-8 h-8 text-gray-700" />
              </button>
              <img
                src={logo}
                alt="Lauratek Small Logo"
                className="w-10 h-10 object-contain transition-all duration-300 animate-in fade-in zoom-in duration-300"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full relative">
              <img
                src={logo}
                alt="Lauratek Logo"
                className="h-11 object-contain transition-all duration-300 animate-in fade-in duration-300"
              />
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-600 hover:bg-gray-100 h-8 w-8 flex items-center justify-center rounded-lg absolute right-0 transition-colors"
                aria-label="Collapse Sidebar"
              >
                <MdKeyboardDoubleArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto no-scrollbar mt-1">
          <nav className="flex flex-col space-y-0.5 py-1">
            {menuSections.map((section) => (
              <div key={section.title} className="mb-4">
                {/* Title */}
                {isSidebarOpen && (
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2 px-4">
                    {section.title}
                  </p>
                )}

                {/* Items */}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isCurrentlyActive = (() => {
                      if (item.path === "/quizzes/questions") {
                        return location.pathname.includes("/quizzes/questions") ||
                          (location.pathname.includes("/quizzes") && location.pathname.includes("/questions"));
                      }
                      if (item.path === "/quizzes") {
                        if (location.pathname.includes("/questions")) return false;
                        return location.pathname === "/quizzes" || location.pathname.startsWith("/quizzes/");
                      }
                      return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    })();

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          setProfileModalOpen(false);
                          if (window.innerWidth < 768) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        title={!isSidebarOpen ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-3.5 px-4 py-2.5 mx-3 my-0.5 text-[16px] transition-all duration-200 relative rounded-xl group",
                          isCurrentlyActive && !profileModalOpen
                            ? "bg-[#F3E8FF] text-[#5D3EFC] font-semibold"
                            : "text-[#64748B] hover:bg-gray-50/80 hover:text-gray-900 font-medium",
                          !isSidebarOpen && "md:justify-center md:mx-1.5 md:px-0"
                        )}
                      >
                        {/* Left accent bar for active item */}
                        {isCurrentlyActive && !profileModalOpen && isSidebarOpen && (
                          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#5D3EFC] rounded-full" />
                        )}

                        <item.icon
                          className={cn(
                            "w-[18px] h-[18px] flex-shrink-0 stroke-[1.75]",
                            isCurrentlyActive && !profileModalOpen ? "text-[#5D3EFC]" : "text-gray-400"
                          )}
                        />

                        {isSidebarOpen && <span className="min-w-0 truncate">{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Bottom Buttons */}
            <div className="pt-2 shrink-0 space-y-0.5 mt-auto">
              <div className={cn("border-t border-slate-100 mb-2", isSidebarOpen ? "mx-4" : "mx-2")} />

              <button
                type="button"
                onClick={() => {
                  setProfileModalOpen(true);
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                title={!isSidebarOpen ? "Profile" : undefined}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-2.5 mx-3 my-0.5 text-[16px] transition-all duration-200 relative rounded-xl w-[calc(100%-24px)] text-left group",
                  profileModalOpen
                    ? "bg-[#F3E8FF] text-[#5D3EFC] font-semibold"
                    : "text-[#64748B] hover:bg-gray-50/80 hover:text-gray-900 font-medium",
                  !isSidebarOpen && "md:justify-center md:mx-1.5 md:w-[calc(100%-12px)] md:px-0"
                )}
              >
                {profileModalOpen && isSidebarOpen && (
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#5D3EFC] rounded-full" />
                )}
                <IoPersonSharp
                  className={cn(
                    "w-[18px] h-[18px] flex-shrink-0",
                    profileModalOpen ? "text-[#5D3EFC]" : "text-gray-400"
                  )}
                />
                {isSidebarOpen && <span className="min-w-0 truncate">Profile</span>}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                title={!isSidebarOpen ? "Logout" : undefined}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-2.5 mx-3 my-0.5 text-[16px] transition-all duration-200 relative rounded-xl w-[calc(100%-24px)] text-left group",
                  "text-[#64748B] hover:bg-gray-50/80 hover:text-gray-900 font-medium",
                  !isSidebarOpen && "md:justify-center md:mx-1.5 md:w-[calc(100%-12px)] md:px-0"
                )}
              >
                <LogOut className="w-[18px] h-[18px] flex-shrink-0 text-gray-400" />
                {isSidebarOpen && <span className="min-w-0 truncate">Logout</span>}
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardSidebar;
