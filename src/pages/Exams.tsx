import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, FileCode, ListChecks } from 'lucide-react';
import { mockExams } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Exams = () => {
  const [exams] = useState(mockExams);

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'Weekly': return 'bg-primary';
      case 'Monthly': return 'bg-secondary';
      case 'Mock': return 'bg-accent-foreground';
      case 'Course Completion': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const renderExamTable = (examType: string) => {
    const filteredExams = exams.filter(exam => exam.type === examType);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Exam ID</th>
              <th className="text-left py-3 px-4">Course</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Students</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExams.map((exam) => (
              <tr key={exam.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4 font-medium">{exam.id}</td>
                <td className="py-3 px-4">{exam.courseName}</td>
                <td className="py-3 px-4">{new Date(exam.date).toLocaleDateString()}</td>
                <td className="py-3 px-4">{exam.students}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info('Viewing exam')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success('Viewing answers')}
                    >
                      Student Answers
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success('Adding clue')}
                    >
                      Add Clue
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success('Updating test cases')}
                    >
                      Test Cases
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Exams Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2">
            <ListChecks className="w-4 h-4" />
            Add MCQs
          </Button>
          <Button className="gap-2">
            <FileCode className="w-4 h-4" />
            Add Coding Questions
          </Button>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Exams ({exams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="Weekly">Weekly</TabsTrigger>
              <TabsTrigger value="Monthly">Monthly</TabsTrigger>
              <TabsTrigger value="Mock">Mock</TabsTrigger>
              <TabsTrigger value="Course Completion">Course Completion</TabsTrigger>
            </TabsList>
            <TabsContent value="Weekly" className="mt-4">
              {renderExamTable('Weekly')}
            </TabsContent>
            <TabsContent value="Monthly" className="mt-4">
              {renderExamTable('Monthly')}
            </TabsContent>
            <TabsContent value="Mock" className="mt-4">
              {renderExamTable('Mock')}
            </TabsContent>
            <TabsContent value="Course Completion" className="mt-4">
              {renderExamTable('Course Completion')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Exams;
