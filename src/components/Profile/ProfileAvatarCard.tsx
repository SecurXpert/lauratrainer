import React from 'react';
import { Camera, Mail, Phone, MapPin } from 'lucide-react';
import { API_BASE_URL } from "../../pages/services/api/api";

interface ProfileAvatarCardProps {
  profile: any;
  profileLoading: boolean;
  imageFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleAvatarClick: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  firstName: string;
  lastName: string;
}

const ProfileAvatarCard: React.FC<ProfileAvatarCardProps> = ({
  profile,
  profileLoading,
  imageFile,
  fileInputRef,
  handleAvatarClick,
  handleFileChange,
  firstName,
  lastName,
}) => {
  const previewUrl = imageFile
    ? URL.createObjectURL(imageFile)
    : profile.profile_picture
      ? profile.profile_picture.startsWith('http')
        ? profile.profile_picture
        : `${API_BASE_URL}${profile.profile_picture.startsWith('/') ? '' : '/'}${profile.profile_picture}`
      : null;

  const userInitials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : profile.name
      ? profile.name.substring(0, 2).toUpperCase()
      : 'SJ';

  return (
    <div className="bg-white border-[1.35px] border-[#E5E7EB] rounded-[22px] p-8 flex flex-col items-center shadow-sm relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.03),_transparent_45%)]">
      <div
        onClick={handleAvatarClick}
        className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#7C3AED] text-white flex items-center justify-center font-bold text-[38px] shadow-[0_16px_32px_-8px_rgba(124,58,237,0.4)] cursor-pointer group hover:scale-[1.03] transition-all duration-200 border-2 border-white/20 overflow-hidden"
      >
        {previewUrl ? (
          <img src={previewUrl} className="w-full h-full object-cover" alt="Profile" />
        ) : (
          <span className="tracking-wider">{userInitials}</span>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1.5">
          <Camera className="w-5.5 h-5.5 text-white" />
          <span className="text-[9.5px] text-white/90 font-bold uppercase tracking-wider">Change</span>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {imageFile && (
        <p className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mt-3.5 animate-pulse">
          Preview Mode
        </p>
      )}

      {profileLoading && !profile.name ? (
        <div className="space-y-2 mt-5 flex flex-col items-center">
          <div className="h-5 w-28 bg-slate-200 animate-pulse rounded"></div>
          <div className="h-4 w-36 bg-slate-100 animate-pulse rounded mt-2"></div>
          <div className="mt-4 h-8 w-24 bg-slate-100 animate-pulse rounded-full"></div>
        </div>
      ) : (
        <>
          <h2 className="text-[21px] font-bold text-[#0F172A] mt-5 capitalize">
            {profile.name || "Trainer"}
          </h2>

          <div className="mt-5 w-full space-y-3.5 border-t border-slate-100/80 pt-5 text-left">
            <div className="flex items-center gap-3 text-slate-500 text-[13px] font-semibold">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="break-all">{profile.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-[13px] font-semibold">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{profile.phone || "No phone"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-[13px] font-semibold">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{profile.address || "No address"}</span>
            </div>
          </div>

          <div className="mt-5 h-8 px-4 flex items-center justify-center text-[12px] font-bold text-[#6366F1] bg-[#EEF2FF] border border-[#E0E7FF] rounded-full">
            {profile.role || "Instructor"}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileAvatarCard;
