import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, X } from 'lucide-react';
import { QuestionForm } from './CodingQuestionsTypes';

interface CodingQuestionFormProps {
  isFormOpen: boolean;
  isEditing: boolean;
  form: QuestionForm;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof QuestionForm) => void;
  handleTestCaseChange: (index: number, field: 'input' | 'output', value: string) => void;
  addTestCase: () => void;
  removeTestCase: (index: number) => void;
  addSuggestion: () => void;
  removeSuggestion: (index: number) => void;
  handleSuggestionChange: (index: number, value: string) => void;
  resetForm: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const CodingQuestionForm: React.FC<CodingQuestionFormProps> = ({
  isFormOpen,
  isEditing,
  form,
  loading,
  handleChange,
  handleTestCaseChange,
  addTestCase,
  removeTestCase,
  addSuggestion,
  removeSuggestion,
  handleSuggestionChange,
  resetForm,
  handleSubmit
}) => {
  if (!isFormOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-8 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl mx-4 border-t-4 border-primary relative">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={resetForm}>
          <X size={20} />
        </Button>

        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditing ? 'Edit Coding Question' : 'Add New Coding Question'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Update the existing problem' : 'Create a new problem for students to solve'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 pb-8">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Valid Parentheses"
                value={form.title}
                onChange={(e) => handleChange(e, 'title')}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="question">Question Statement *</Label>
              <Textarea
                id="question"
                placeholder="Describe the problem clearly..."
                rows={5}
                value={form.question}
                onChange={(e) => handleChange(e, 'question')}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Detailed Description / Constraints</Label>
              <Textarea
                id="description"
                placeholder="Constraints, notes, input format, etc."
                rows={6}
                value={form.description}
                onChange={(e) => handleChange(e, 'description')}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>Sample Input</Label>
                <Textarea
                  placeholder="0 1 0 3 12\n0"
                  rows={4}
                  value={form.sample_inputs}
                  onChange={(e) => handleChange(e, 'sample_inputs')}
                />
              </div>
              <div className="grid gap-2">
                <Label>Sample Output</Label>
                <Textarea
                  placeholder="1 3 12 0 0\n0"
                  rows={4}
                  value={form.sample_outputs}
                  onChange={(e) => handleChange(e, 'sample_outputs')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Test Cases *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                  <Plus className="h-4 w-4 mr-2" /> Add Test Case
                </Button>
              </div>

              {form.test_cases.map((tc, index) => (
                <div
                  key={index}
                  className="grid md:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/40 relative"
                >
                  <div className="grid gap-2">
                    <Label>Input {index + 1}</Label>
                    <Textarea
                      placeholder="e.g. 0 1 0 3 12"
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Expected Output {index + 1}</Label>
                    <Textarea
                      placeholder="e.g. 1 3 12 0 0"
                      value={tc.output}
                      onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                      rows={3}
                    />
                  </div>
                  {form.test_cases.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-destructive"
                      onClick={() => removeTestCase(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Hints / Suggestions (optional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSuggestion}>
                  <Plus className="h-4 w-4 mr-2" /> Add Hint
                </Button>
              </div>

              {form.suggestion.map((hint, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Textarea
                    placeholder={`Hint ${index + 1}`}
                    value={hint}
                    onChange={(e) => handleSuggestionChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-1 text-destructive"
                    onClick={() => removeSuggestion(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-6 flex gap-4">
              <Button
                type="submit"
                className="flex-1 md:flex-none px-10"
                disabled={loading}
                size="lg"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Question' : 'Add Question'}
              </Button>

              <Button type="button" variant="outline" size="lg" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodingQuestionForm;
