import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Eye, Trash2, FileCode, ListChecks } from 'lucide-react';
import { mockQuizzes } from '@/data/mockData';
import { toast } from 'sonner';

const Quizzes = () => {
  const [quizzes] = useState(mockQuizzes);

  const mcqQuizzes = quizzes.filter(q => q.type === 'MCQ');
  const codingQuizzes = quizzes.filter(q => q.type === 'Coding');

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
          <Button className="gap-2">
            <ListChecks className="w-4 h-4" />
            Add MCQ
          </Button>
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
