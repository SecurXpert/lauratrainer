import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProfileInfoCardProps {
  firstName: string;
  setFirstName: (val: string) => void;
  profile: any;
  setProfile: (val: any) => void;
  profileLoading: boolean;
  handleUpdateProfile: () => void;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  firstName,
  setFirstName,
  profile,
  setProfile,
  profileLoading,
  handleUpdateProfile,
}) => {
  return (
    <div className="bg-white border-[1.35px] border-[#E5E7EB] rounded-[22px] p-6 md:p-8 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center mr-3.5 shadow-sm">
          <User className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="font-bold text-[17px] text-[#0F172A]">Personal Information</h3>
          <p className="text-[12.5px] text-slate-400 font-medium mt-0.5">Update your personal details and address</p>
        </div>
      </div>

      <div className="mb-5">
        <div className="space-y-2">
          <Label className="text-[13px] text-[#0F172A] font-semibold">Full Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={firstName}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[a-zA-Z\s]*$/.test(val)) {
                  setFirstName(val);
                }
              }}
              placeholder="First Name"
              maxLength={15}
              className="pl-11 h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 focus-visible:ring-0 cursor-text"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="space-y-2">
          <Label className="text-[13px] text-[#0F172A] font-semibold">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={profile.email !== null && profile.email !== undefined ? profile.email : (localStorage.getItem("trainer_email") || '')}
              onChange={(e) => setProfile((prev: any) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              className="pl-11 h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 focus-visible:ring-0 cursor-text"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[13px] text-[#0F172A] font-semibold">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={profile.phone !== null && profile.phone !== undefined ? profile.phone : (localStorage.getItem("trainer_phone") || '')}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setProfile((prev: any) => ({ ...prev, phone: val }));
                }
              }}
              placeholder="e.g. 1234567890"
              maxLength={10}
              className="pl-11 h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 focus-visible:ring-0 cursor-text"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <Label className="text-[13px] text-[#0F172A] font-semibold">Address</Label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            value={profile.address !== null && profile.address !== undefined ? profile.address : (localStorage.getItem("trainer_address") || '')}
            onChange={(e) => setProfile((prev: any) => ({ ...prev, address: e.target.value }))}
            placeholder="Enter your address"
            maxLength={150}
            className="pl-11 h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 focus-visible:ring-0 cursor-text"
          />
        </div>
      </div>

      <div className="py-5 border-t border-slate-100/90 my-5 space-y-5">
        <h4 className="text-[14.5px] font-bold text-[#0F172A]">Professional details</h4>

        <div className="space-y-2">
          <Label className="text-[13px] text-[#0F172A] font-semibold">Bio</Label>
          <Input
            value={profile.bio}
            onChange={(e) => setProfile((prev: any) => ({ ...prev, bio: e.target.value }))}
            placeholder="Short description about yourself"
            maxLength={100}
            className="h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 cursor-text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-[13px] text-[#0F172A] font-semibold">LinkedIn URL</Label>
            <Input
              type="url"
              value={profile.linkedin}
              onChange={(e) => setProfile((prev: any) => ({ ...prev, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/in/username"
              className="h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 cursor-text"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <Button
          onClick={handleUpdateProfile}
          disabled={profileLoading}
          className="h-11 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-[13px] rounded-[14px] shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)] transition-all cursor-pointer"
        >
          {profileLoading ? 'Updating…' : 'Update Profile'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileInfoCard;
