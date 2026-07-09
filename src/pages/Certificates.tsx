import { useState, useMemo } from "react";
import { useCertificatesData } from "@/components/Certificates/useCertificatesData";
import { useCertificatesMutations } from "@/components/Certificates/useCertificatesMutations";
import { CertificatesHeader } from "@/components/Certificates/CertificatesHeader";
import { GenerateSingleCard } from "@/components/Certificates/GenerateSingleCard";
import { GenerateBulkCard } from "@/components/Certificates/GenerateBulkCard";
import { CertificatesFilters } from "@/components/Certificates/CertificatesFilters";
import { CertificatesList } from "@/components/Certificates/CertificatesList";
import { CertificateModal } from "@/components/Certificates/CertificateModal";

export default function Certificates() {
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [date, setDate] = useState("");

  const {
    courses,
    certificateRows,
    filterCourseId,
    setFilterCourseId,
    totalCertificates,
    thisMonthCertificatesCount,
    setRefreshTrigger
  } = useCertificatesData();

  const {
    generatingSingle,
    manualStudentId, setManualStudentId,
    manualCourseId, setManualCourseId,
    generatingBulk,
    bulkCourseId, setBulkCourseId,
    bulkStudentIds, setBulkStudentIds,
    generateSingleCertificate,
    generateBulkCertificates,
    handleDownload
  } = useCertificatesMutations(setFilterCourseId, setRefreshTrigger);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDate("");
    setStatusFilter("All Status");
    if (courses && courses.length > 0) {
      setFilterCourseId("");
    } else {
      setFilterCourseId("");
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const filteredCerts = useMemo(() => {
    return certificateRows.filter(row => {
      const matchesSearch = !searchTerm.trim() ||
        (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.studentId && row.studentId.includes(searchTerm)) ||
        (row.certificateNo && row.certificateNo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDate = !date || row.date === date;
      const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [certificateRows, searchTerm, date, statusFilter]);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-2 md:p-3 overflow-x-hidden">
      <div className="w-full">
        <CertificatesHeader 
          totalCertificates={totalCertificates} 
          thisMonthCertificatesCount={thisMonthCertificatesCount} 
        />

        <GenerateSingleCard 
          generatingSingle={generatingSingle} 
          manualStudentId={manualStudentId} setManualStudentId={setManualStudentId} 
          manualCourseId={manualCourseId} setManualCourseId={setManualCourseId} 
          generateSingleCertificate={generateSingleCertificate} 
        />

        <GenerateBulkCard 
          generatingBulk={generatingBulk} 
          bulkStudentIds={bulkStudentIds} setBulkStudentIds={setBulkStudentIds} 
          bulkCourseId={bulkCourseId} setBulkCourseId={setBulkCourseId} 
          generateBulkCertificates={generateBulkCertificates} 
        />

        <CertificatesFilters 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
          filterCourseId={filterCourseId} setFilterCourseId={setFilterCourseId} 
          date={date} setDate={setDate} 
          statusFilter={statusFilter} setStatusFilter={setStatusFilter} 
          handleResetFilters={handleResetFilters} 
          courses={courses} 
        />

        <CertificatesList 
          filteredCerts={filteredCerts} 
          setSelectedCert={setSelectedCert} 
          handleDownload={handleDownload} 
        />

        <CertificateModal 
          selectedCert={selectedCert} 
          setSelectedCert={setSelectedCert} 
          handleDownload={handleDownload} 
        />

        <div className="text-center text-sm text-muted-foreground mt-12">
          <p>Certificates are generated on the server.</p>
          <p>Students can download their certificates from their dashboard.</p>
        </div>
      </div>
    </div>
  );
}