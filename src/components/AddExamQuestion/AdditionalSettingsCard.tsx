import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AdditionalSettingsCardProps } from './Types';

export const AdditionalSettingsCard: React.FC<AdditionalSettingsCardProps> = ({ points, timeLimit, onChange }) => (
  <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
    <CardContent className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-5">Additional Settings</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[14px] font-semibold text-gray-800">Points <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={points || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 2);
              onChange('points', val ? parseInt(val, 10) : '');
            }}
            placeholder="e.g., 10"
            className="h-11 rounded-xl bg-gray-50 border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[14px] font-semibold text-gray-800">Time Limit (minutes) <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={timeLimit || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              onChange('time_limit', val ? parseInt(val, 10) : '');
            }}
            placeholder="e.g., 5"
            className="h-11 rounded-xl bg-gray-50 border-gray-200"
          />
        </div>
      </div>
    </CardContent>
  </Card>
);
