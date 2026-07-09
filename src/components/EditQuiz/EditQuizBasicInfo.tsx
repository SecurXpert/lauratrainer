import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EditQuizBasicInfoProps {
  title: string;
  setTitle: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
}

const EditQuizBasicInfo: React.FC<EditQuizBasicInfoProps> = ({
  title, setTitle, category, setCategory, status, setStatus, description, setDescription
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
      <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-semibold text-slate-700">Quiz Name</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 35))}
            maxLength={35}
            placeholder="Enter quiz name"
            className="mt-2 h-11 rounded-xl bg-slate-50 border-0 focus:bg-white transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-slate-700">Category</Label>
            <Input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Programming"
              className="mt-2 h-11 rounded-xl bg-slate-50 border-0 focus:bg-white transition"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold text-slate-700">Status</Label>
            <Input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="e.g. Active"
              className="mt-2 h-11 rounded-xl bg-slate-50 border-0 focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-slate-700">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 180))}
            maxLength={180}
            placeholder="Enter quiz description"
            rows={4}
            className="mt-2 rounded-xl bg-slate-50 border-0 resize-none focus:bg-white transition"
          />
        </div>
      </div>
    </div>
  );
};

export default EditQuizBasicInfo;
