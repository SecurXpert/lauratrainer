import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Eye, Trash2, FileCode, ListChecks, Upload } from 'lucide-react';
import { mockQuizzes } from '@/data/mockData';
import { toast } from 'sonner';

const Quizzes = () => {
  const [quizzes] = useState(mockQuizzes);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const mcqQuizzes = quizzes.filter(q => q.type === 'MCQ');
  const codingQuizzes = quizzes.filter(q => q.type === 'Coding');

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('https://lauratek.in:8000/trainer/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Quiz added successfully');
        setOpen(false);
        setFile(null);
        // Optionally, refresh quizzes list here
      } else {
        toast.error('Failed to add quiz');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const QuizTable = ({ quizzes, type }: { quizzes: typeof mockQuizzes, type: string }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Quiz ID</th>
            <th className="text-left py-3 px-4">Course Name</th>
            <th className="text-left py-3 px-4">Questions</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz) => (
            <tr key={quiz.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 font-medium">{quiz.id}</td>
              <td className="py-3 px-4">{quiz.courseName}</td>
              <td className="py-3 px-4">{quiz.questions}</td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info('Viewing quiz')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {type === 'Coding' && (
                    <>
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
                        onClick={() => toast.success('Adding test cases')}
                      >
                        Test Cases
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success('Adding answers')}
                      >
                        Answers
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => toast.error('Quiz deleted')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Quizzes Management</h1>
        <div className="flex flex-wrap gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <ListChecks className="w-4 h-4" />
                Add MCQ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload MCQ File</DialogTitle>
                <DialogDescription>
                  Select a file to upload your MCQ quiz.
                </DialogDescription>
              </DialogHeader>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={!file || loading}
                >
                  {loading ? 'Uploading...' : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="gap-2">
            <FileCode className="w-4 h-4" />
            Add Coding Question
          </Button>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mcq">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mcq">MCQs ({mcqQuizzes.length})</TabsTrigger>
              <TabsTrigger value="coding">Coding Questions ({codingQuizzes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="mcq" className="mt-6">
              <QuizTable quizzes={mcqQuizzes} type="MCQ" />
            </TabsContent>

            <TabsContent value="coding" className="mt-6">
              <QuizTable quizzes={codingQuizzes} type="Coding" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quizzes;