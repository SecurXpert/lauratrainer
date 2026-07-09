import React from 'react';
import { Button } from '@/components/ui/button';
import { Code2, Plus, Upload } from 'lucide-react';

interface CodingQuestionsHeaderProps {
  triggerFileInput: () => void;
  setIsFormOpen: (open: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const CodingQuestionsHeader: React.FC<CodingQuestionsHeaderProps> = ({
  triggerFileInput,
  setIsFormOpen,
  fileInputRef,
  handleCsvUpload
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Code2 className="h-8 w-8 text-primary" />
          Coding Questions
        </h1>
        <div className="flex gap-3">
          <Button onClick={triggerFileInput} variant="secondary" className="gap-2">
            <Upload size={18} /> Upload CSV
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus size={18} /> Add New Question
          </Button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleCsvUpload}
        className="hidden"
      />
    </>
  );
};

export default CodingQuestionsHeader;
