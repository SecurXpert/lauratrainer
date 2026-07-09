import React from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProfileSecurityCardProps {
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  handleChangePassword: () => void;
  passwordLoading: boolean;
  showCurrentPassword: boolean;
  setShowCurrentPassword: (val: boolean) => void;
  showNewPassword: boolean;
  setShowNewPassword: (val: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (val: boolean) => void;
}

const ProfileSecurityCard: React.FC<ProfileSecurityCardProps> = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleChangePassword,
  passwordLoading,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) => {
  return (
    <div className="bg-white border-[1.35px] border-[#E5E7EB] rounded-[22px] p-6 md:p-8 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center mr-3.5 shadow-sm">
          <Shield className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="font-bold text-[17px] text-[#0F172A]">Security Settings</h3>
          <p className="text-[12.5px] text-slate-400 font-medium mt-0.5">Manage password and security details</p>
        </div>
      </div>

      <div className="space-y-5 mb-5">
        <div className="space-y-2">
          <Label className="text-[13px] text-[#0F172A] font-semibold">Current Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="pl-11 pr-11 h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 focus-visible:ring-0 cursor-text"
            />
            <button
              type="button"
              onClick={() => {
                setShowCurrentPassword(!showCurrentPassword);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-[13px] text-[#0F172A] font-semibold">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pl-11 pr-11 h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 focus-visible:ring-0 cursor-text"
              />
              <button
                type="button"
                onClick={() => {
                  setShowNewPassword(!showNewPassword);
                  setShowCurrentPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] text-[#0F172A] font-semibold">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pl-11 pr-11 h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 focus-visible:ring-0 cursor-text"
              />
              <button
                type="button"
                onClick={() => {
                  setShowConfirmPassword(!showConfirmPassword);
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#EEF2FF]/60 border border-[#E0E7FF] text-[#6366F1] text-[12px] p-4 rounded-xl font-medium leading-relaxed mb-6">
        <span className="font-extrabold text-[#4F46E5] mr-1">Password requirements:</span>
        At least 8 characters, including uppercase, lowercase, number, and special character.
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleChangePassword}
          disabled={passwordLoading}
          className="h-11 px-8 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-[13px] rounded-[14px] shadow-sm transition-all cursor-pointer"
        >
          {passwordLoading ? 'Updating…' : 'Change Password'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSecurityCard;
