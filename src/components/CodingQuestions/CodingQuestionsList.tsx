import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, List, Trash2 } from 'lucide-react';
import { Question } from './CodingQuestionsTypes';

interface CodingQuestionsListProps {
  fetching: boolean;
  questions: Question[];
  startEdit: (q: Question) => void;
  handleDelete: (id: number) => void;
}

const CodingQuestionsList: React.FC<CodingQuestionsListProps> = ({
  fetching,
  questions,
  startEdit,
  handleDelete
}) => {
  return (
    <Card className="mb-10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List size={20} /> Available Questions
        </CardTitle>
        <CardDescription>Manage existing coding problems</CardDescription>
      </CardHeader>
      <CardContent>
        {fetching ? (
          <p className="text-center py-8 text-muted-foreground">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">
            No questions found. Add your first question!
          </p>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.question_id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/40 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                      ID: {q.question_id}
                    </span>
                    <h3 className="font-medium">{q.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {q.question.substring(0, 120)}...
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(q)}>
                    <Edit size={16} className="mr-1" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(q.question_id)}
                  >
                    <Trash2 size={16} className="mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodingQuestionsList;
