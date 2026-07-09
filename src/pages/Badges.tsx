import React, { useState, useEffect } from "react";
import { useBadgesData } from "@/components/Badges/useBadgesData";
import { useBadgesMutations } from "@/components/Badges/useBadgesMutations";
import { BadgesHeader } from "@/components/Badges/BadgesHeader";
import { BadgesStats } from "@/components/Badges/BadgesStats";
import { BadgesFilters } from "@/components/Badges/BadgesFilters";
import { BadgesList } from "@/components/Badges/BadgesList";
import { CreateBadgeModal } from "@/components/Badges/CreateBadgeModal";
import { EvaluateBadgeModal } from "@/components/Badges/EvaluateBadgeModal";

const Badges: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedBadgeIdForEval, setSelectedBadgeIdForEval] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);

  const { courses, badges, setBadges, students, loading, setLoading, error } = useBadgesData(selectedCourseId);

  const { formData, handleInputChange, handleCreateSubmit, handleEvaluateSubmit } = useBadgesMutations(
    selectedCourseId, setBadges, setLoading, setIsCreateModalOpen, setIsEvaluateModalOpen, 
    selectedBadgeIdForEval, selectedStudentId, setSelectedStudentId, setSelectedBadgeIdForEval
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDate, filterStatus, selectedCourseId]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3">
      <div className="w-full">
        <BadgesHeader 
          setIsCreateModalOpen={setIsCreateModalOpen} 
          setIsEvaluateModalOpen={setIsEvaluateModalOpen} 
          loading={loading} 
          selectedCourseId={selectedCourseId} 
          badgesCount={badges.length} 
        />
        
        <BadgesStats badgesCount={badges.length} studentsCount={students.length} />
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <BadgesFilters 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
          filterDate={filterDate} setFilterDate={setFilterDate} 
          filterStatus={filterStatus} setFilterStatus={setFilterStatus} 
          selectedCourseId={selectedCourseId} setSelectedCourseId={setSelectedCourseId} 
          courses={courses} loading={loading} 
        />

        <BadgesList 
          badges={badges} loading={loading} 
          searchQuery={searchQuery} filterStatus={filterStatus} 
          filterDate={filterDate} currentPage={currentPage} setCurrentPage={setCurrentPage} 
        />

        <CreateBadgeModal 
          isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen}
          handleCreateSubmit={handleCreateSubmit} selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId} courses={courses} loading={loading}
          formData={formData} handleInputChange={handleInputChange}
        />

        <EvaluateBadgeModal 
          isEvaluateModalOpen={isEvaluateModalOpen} setIsEvaluateModalOpen={setIsEvaluateModalOpen}
          handleEvaluateSubmit={handleEvaluateSubmit} selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId} selectedBadgeIdForEval={selectedBadgeIdForEval}
          setSelectedBadgeIdForEval={setSelectedBadgeIdForEval} loading={loading}
          students={students} badges={badges}
        />
      </div>
    </div>
  );
};

export default Badges;
