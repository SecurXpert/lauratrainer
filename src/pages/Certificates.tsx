import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
 
const API_BASE = 'http://192.168.0.122:10000/trainer';
 
export default function Certificates() {
  const [generatingBulk, setGeneratingBulk] = useState(false);
  const [generatingSingle, setGeneratingSingle] = useState(false);
 
  const [bulkCourseId, setBulkCourseId] = useState<string>('');
  const [bulkStudentIds, setBulkStudentIds] = useState<string>('');
 
  const [manualStudentId, setManualStudentId] = useState<string>('');
  const [manualCourseId, setManualCourseId] = useState<string>('');
 
  const token = localStorage.getItem('access_token');
 
  const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
 
  const generateSingleCertificate = async () => {
    const studentId = Number(manualStudentId.trim());
    const courseId = Number(manualCourseId.trim());
 
    if (!studentId || isNaN(studentId) || studentId <= 0) {
      return toast.error('Please enter a valid student ID');
    }
    if (!courseId || isNaN(courseId) || courseId <= 0) {
      return toast.error('Please enter a valid course ID');
    }
 
    setGeneratingSingle(true);
 
    try {
      const res = await axiosInstance.post(
        `/students/${studentId}/courses/${courseId}/certificate`
      );
 
      toast.success(
        res.data?.certificate_no
          ? `Certificate generated: ${res.data.certificate_no}`
          : 'Certificate generated successfully!'
      );
 
      if (res.data?.file_url) {
        toast.info('Certificate generated — you can now download it from student portal', {
          duration: 6000,
        });
      }
 
      // Optional: clear inputs after success
      setManualStudentId('');
      setManualCourseId('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to generate certificate';
      toast.error(msg);
    } finally {
      setGeneratingSingle(false);
    }
  };
 
  const generateBulkCertificates = async () => {
    const courseIdNum = Number(bulkCourseId.trim());
    if (!courseIdNum || isNaN(courseIdNum) || courseIdNum <= 0) {
      return toast.error('Please enter a valid course ID');
    }
 
    setGeneratingBulk(true);
 
    try {
      let payload: any = null; // default: no body → generate for all
 
      // If user entered specific student IDs
      if (bulkStudentIds.trim()) {
        const studentIds = bulkStudentIds
          .split(',')
          .map(id => Number(id.trim()))
          .filter(id => !isNaN(id) && id > 0);
 
        if (studentIds.length === 0) {
          return toast.error('Invalid student IDs format. Use comma-separated numbers, e.g. 12,15,18');
        }
 
        payload = {
          student_ids: studentIds,   // most common name
        };
      }
 
      const res = await axiosInstance.post(
        `/courses/${courseIdNum}/certificates/bulk`,
        payload
      );
 
      toast.success(
        `Requested: ${res.data?.requested || res.data?.total || 0} | ` +
        `Generated: ${res.data?.generated || 0} | ` +
        `Skipped: ${res.data?.skipped || res.data?.existing || 0}`
      );
 
      // Optional: clear fields after success
      setBulkCourseId('');
      setBulkStudentIds('');
    } catch (err: any) {
      console.error('Bulk generation failed:', err?.response?.data || err);
 
      const errorDetail = err?.response?.data;
      let msg = 'Bulk generation failed';
 
      if (errorDetail?.detail) {
        msg += ` - ${JSON.stringify(errorDetail.detail)}`;
      } else if (errorDetail?.message) {
        msg += ` - ${errorDetail.message}`;
      } else {
        msg += ' (check console for details)';
      }
 
      toast.error(msg, { duration: 8000 });
    } finally {
      setGeneratingBulk(false);
    }
  };
 
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <GraduationCap className="w-9 h-9 text-primary" />
        <h1 className="text-3xl font-bold">Generate Certificates</h1>
      </div>
 
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Generate Single Certificate</CardTitle>
          <CardDescription>
            Manually issue certificate for one student (useful for testing / corrections)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-end">
          <div>
            <Label htmlFor="studentId" className="mb-1.5 block">Student ID</Label>
            <Input
              id="studentId"
              type="number"
              placeholder="e.g. 12"
              value={manualStudentId}
              onChange={(e) => setManualStudentId(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="courseIdManual" className="mb-1.5 block">Course ID</Label>
            <Input
              id="courseIdManual"
              type="number"
              placeholder="e.g. 1"
              value={manualCourseId}
              onChange={(e) => setManualCourseId(e.target.value)}
            />
          </div>
          <Button
            onClick={generateSingleCertificate}
            disabled={generatingSingle || !manualStudentId.trim() || !manualCourseId.trim()}
            className="sm:col-span-2 lg:col-span-1"
          >
            {generatingSingle ? 'Generating...' : 'Generate Certificate'}
          </Button>
        </CardContent>
      </Card>
 
      <Card className="mb-8 bg-muted/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Bulk Generate Certificates</CardTitle>
          <CardDescription>
            Generate certificates for an entire course (or selected students) — trainer/admin only
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
          <div>
            <Label htmlFor="courseIdBulk" className="text-sm font-medium block mb-1.5">
              Course ID
            </Label>
            <Input
              id="courseIdBulk"
              type="number"
              value={bulkCourseId}
              onChange={(e) => setBulkCourseId(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>
          <div>
            <Label htmlFor="studentIdsBulk" className="text-sm font-medium block mb-1.5">
              Student IDs (optional, comma separated)
            </Label>
            <Input
              id="studentIdsBulk"
              type="text"
              value={bulkStudentIds}
              onChange={(e) => setBulkStudentIds(e.target.value)}
              placeholder="e.g. 12,15,18 or leave empty for all students"
            />
          </div>
          <Button
            onClick={generateBulkCertificates}
            disabled={generatingBulk || !bulkCourseId.trim()}
            className="sm:col-span-2 lg:col-span-1"
          >
            {generatingBulk ? 'Generating...' : 'Generate Bulk'}
          </Button>
        </CardContent>
      </Card>
 
      <div className="text-center text-sm text-muted-foreground mt-12">
        <p>Certificates are generated on the server.</p>
        <p>Students can download their certificates from their dashboard.</p>
      </div>
    </div>
  );
}
 
 