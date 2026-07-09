import { FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  generatingSingle: boolean;
  manualStudentId: string;
  setManualStudentId: (val: string) => void;
  manualCourseId: string;
  setManualCourseId: (val: string) => void;
  generateSingleCertificate: () => void;
}

export const GenerateSingleCard = ({ generatingSingle, manualStudentId, setManualStudentId, manualCourseId, setManualCourseId, generateSingleCertificate }: Props) => {
  return (
    <Card className="mb-6 sm:mb-8 rounded-[20px] border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Generate Single Certificate</CardTitle>
          <CardDescription className="text-gray-500 mt-1">Manually issue certificate for one student (useful for testing / corrections)</CardDescription>
        </div>
        <Button
          onClick={generateSingleCertificate}
          disabled={generatingSingle || !manualStudentId.trim() || !manualCourseId.trim()}
          className="w-full lg:w-auto min-w-[220px] h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2 shrink-0"
        >
          <FaPlus className="h-4 w-4 shrink-0" />
          {generatingSingle ? "Generating..." : "Generate Certificate"}
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <Label htmlFor="studentId" className="mb-2 block text-gray-900">Student ID</Label>
          <Input id="studentId" type="text" inputMode="numeric" placeholder="Enter Student ID" value={manualStudentId} maxLength={6} onChange={(e) => setManualStudentId(e.target.value.replace(/\D/g, ""))} className="h-12 rounded-xl bg-gray-50 border-gray-200" />
        </div>
        <div>
          <Label htmlFor="courseIdManual" className="mb-2 block text-gray-900">Course ID</Label>
          <Input id="courseIdManual" type="text" inputMode="numeric" placeholder="Enter Course ID" value={manualCourseId} maxLength={6} onChange={(e) => setManualCourseId(e.target.value.replace(/\D/g, ""))} className="h-12 rounded-xl bg-gray-50 border-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
};
