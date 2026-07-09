import { FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  generatingBulk: boolean;
  bulkStudentIds: string;
  setBulkStudentIds: (val: string) => void;
  bulkCourseId: string;
  setBulkCourseId: (val: string) => void;
  generateBulkCertificates: () => void;
}

export const GenerateBulkCard = ({ generatingBulk, bulkStudentIds, setBulkStudentIds, bulkCourseId, setBulkCourseId, generateBulkCertificates }: Props) => {
  return (
    <Card className="mb-6 sm:mb-8 rounded-2xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Bulk Generate Certificates</CardTitle>
          <CardDescription className="text-gray-500 mt-1">Generate certificates for an entire course (or selected students) — trainer/admin only</CardDescription>
        </div>
        <Button
          onClick={generateBulkCertificates}
          disabled={generatingBulk || !bulkCourseId.trim()}
          className="w-full lg:w-auto min-w-[190px] h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2 shrink-0"
        >
          <FaPlus className="h-4 w-4 shrink-0" />
          {generatingBulk ? "Generating..." : "Generate Bulk"}
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <Label htmlFor="studentIdsBulk" className="mb-2 block text-gray-900">Student ID</Label>
          <Input id="studentIdsBulk" type="text" inputMode="numeric" value={bulkStudentIds} maxLength={6} onChange={(e) => setBulkStudentIds(e.target.value.replace(/\D/g, ""))} placeholder="Enter Student ID" className="h-12 rounded-xl bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label htmlFor="courseIdBulk" className="mb-2 block text-gray-900">Course ID</Label>
          <Input id="courseIdBulk" type="text" inputMode="numeric" value={bulkCourseId} maxLength={6} onChange={(e) => setBulkCourseId(e.target.value.replace(/\D/g, ""))} placeholder="Enter Course ID" className="h-12 rounded-xl bg-gray-50 border-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
};
