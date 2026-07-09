import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExamFormBasicInfoProps {
  title: string;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  titleError: string;
  category: string;
  handleCategoryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categoryError: string;
  collage: string;
  handleCollageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  collageError: string;
  description: string;
  setDescription: (val: string) => void;
}

const ExamFormBasicInfo: React.FC<ExamFormBasicInfoProps> = ({
  title, handleTitleChange, titleError,
  category, handleCategoryChange, categoryError,
  collage, handleCollageChange, collageError,
  description, setDescription
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Exam Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g., Final Examination"
              required
              maxLength={20}
            />
            {titleError && <p className="text-red-500 text-xs mt-1">{titleError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category"
              value={category}
              onChange={handleCategoryChange}
              placeholder="e.g., Science"
              required
              maxLength={20}
            />
            {categoryError && <p className="text-red-500 text-xs mt-1">{categoryError}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="collage" className="text-sm font-medium text-gray-700">
              Course / Branch Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="collage"
              value={collage}
              onChange={handleCollageChange}
              placeholder="e.g., CS101"
              required
              maxLength={10}
            />
            {collageError && <p className="text-red-500 text-xs mt-1">{collageError}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a brief description about this exam..."
            rows={3}
          />
          <p className="text-xs text-gray-400">
            This description will be visible to students when they view the exam.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamFormBasicInfo;
