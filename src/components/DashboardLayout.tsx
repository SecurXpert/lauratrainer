import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProfileModal from "@/components/ProfileModal";
import { getTrainerProfile } from "@/api/authApi";
import DashboardSidebar from "./DashboardLayout/DashboardSidebar";
import DashboardHeader from "./DashboardLayout/DashboardHeader";

const DashboardLayout = () => {
  const { logout } = useAuth();
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

  return (
    <>
      <div className="flex h-screen min-w-0 bg-[#F8FAFC] overflow-x-hidden">
        {/* ================= SIDEBAR ================= */}
        <DashboardSidebar 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          profileModalOpen={profileModalOpen}
          setProfileModalOpen={setProfileModalOpen}
          handleLogout={handleLogout}
        />

        {/* ================= MAIN ================= */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* ================= HEADER ================= */}
          <DashboardHeader 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            profileLoading={profileLoading}
            profileData={profileData}
            setProfileModalOpen={setProfileModalOpen}
          />

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