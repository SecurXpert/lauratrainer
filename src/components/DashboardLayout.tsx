import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/lauratek.png";
import { cn } from "@/lib/utils";
import { IoPersonSharp } from "react-icons/io5";
import ProfileModal from "@/components/ProfileModal";
import { getTrainerProfile } from "@/api/authApi";
import { PiCertificateFill } from "react-icons/pi";
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";

// import { IoNotificationsSharp } from "react-icons/io5";
import {
  LayoutDashboard,
  FileQuestion,
  Bell,
  Menu,
  LogOut,
  PlusSquare,
  Search,
  BarChart,
  Book,
  BookMarked,
  FilePlus,
  ClipboardPenLine,
  Video,
  Film,
  FileText,
  Users,
  Calendar,
  Medal,
  MessageSquare,
  FolderOpen
} from "lucide-react";
const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebar_open");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(() => {
    const cached = localStorage.getItem("trainer_profile");
    return cached ? JSON.parse(cached) : null;
  });
  const [profileLoading, setProfileLoading] = useState(!localStorage.getItem("trainer_profile"));

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

  useEffect(() => {
    localStorage.setItem("sidebar_open", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await getTrainerProfile();
        if (res.success) {
          setProfileData(res);
          localStorage.setItem("trainer_profile", JSON.stringify(res));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();

    window.addEventListener('profile-updated', fetchProfile);
    return () => {
      window.removeEventListener('profile-updated', fetchProfile);
    };
  }, []);

  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
    setProfileModalOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ✅ Sidebar Sections
  const menuSections = [
    {
      title: "OVERVIEW",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/courses", label: "Courses", icon: Book },
        { path: "/curriculum", label: "Curriculum", icon: BookMarked },
      ],
    },
    {
      title: "Assessments",
      items: [
        { path: "/quizzes", label: "Quizzes", icon: FileQuestion },
        { path: "/quizzes/questions", label: "Question Bank", icon: FilePlus },
        { path: "/exam-management", label: "Coding Exam", icon: ClipboardPenLine },
      ],
    },
    {
      title: "Classes",
      items: [
        { path: "/classes", label: "Live Classes", icon: Video },
        { path: "/videos", label: "Recorded Videos", icon: Film },
        { path: "/resources", label: "Resources", icon: FileText },
        { path: "/coursematerials", label: "Course Materials", icon: FolderOpen },
      ],
    },
    {
      title: "Students",
      items: [
        { path: "/mystudents", label: "My Students", icon: Users },
        { path: "/attendance", label: "Attendance", icon: Calendar },
        { path: "/performance", label: "Performance Review", icon: BarChart },
      ],
    },
    {
      title: "More",
      items: [
        { path: "/badges", label: "Badges", icon: Medal },
        { path: "/certificates", label: "Certificates", icon: PiCertificateFill },
        { path: "/chat", label: "Chat", icon: MessageSquare },
        { path: "/analytics", label: "Analytics", icon: BarChart },
      ],
    },
  ];

  return (
    <>
      <div className="flex h-screen min-w-0 bg-[#F8FAFC] overflow-x-hidden">

        {/* ================= SIDEBAR ================= */}
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
                    "flex items-center gap-3.5 px-4 py-2.5 mx-3 my-0.5 text-[16px] transition-all duration-200 relative rounded-xl w-auto text-left group",
                    profileModalOpen
                      ? "bg-[#F3E8FF] text-[#5D3EFC] font-semibold"
                      : "text-[#64748B] hover:bg-gray-50/80 hover:text-gray-900 font-medium",
                    !isSidebarOpen && "md:justify-center md:mx-1.5 md:px-0"
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
                    "flex items-center gap-3.5 px-4 py-2.5 mx-3 my-0.5 text-[16px] transition-all duration-200 relative rounded-xl w-auto text-left group",
                    "text-[#64748B] hover:bg-gray-50/80 hover:text-gray-900 font-medium",
                    !isSidebarOpen && "md:justify-center md:mx-1.5 md:px-0"
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

        {/* ================= MAIN ================= */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">

          {/* ================= HEADER ================= */}
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

          {/* CONTENT */}
          <main
            ref={mainRef}
            className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-0 no-scrollbar relative"
          >
            {profileModalOpen ? (
              <ProfileModal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
              />
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;