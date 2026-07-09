import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface EditQuizSettingsProps {
  duration: string;
  setDuration: (val: string) => void;
}

const EditQuizSettings: React.FC<EditQuizSettingsProps> = ({ duration, setDuration }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Quiz Settings</h2>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            Duration (minutes)
          </Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={duration}
            onChange={(e) => setDuration(e.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder="45"
            className="mt-2 h-11 rounded-xl bg-slate-50 border-0 focus:bg-white transition"
          />
        </div>
      </div>
    </div>
  );
};

export default EditQuizSettings;
