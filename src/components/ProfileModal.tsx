import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Calendar,
  User,
  Clock,
  Globe,
  Users,
  Camera,
  ArrowLeft,
  Shield,
  Bell,
  PenTool,
  MapPin,
  Mail,
  Phone,
  Lock,
  FileText,
  TrendingUp,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';

const API_BASE = 'https://lauratek.in:8000';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Password states ────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Profile states ─────────────────────────────────────────
  const [profile, setProfile] = useState(() => {
    const cached = localStorage.getItem("trainer_profile");
    if (cached) {
      const data = JSON.parse(cached);
      return {
        name: data.name ?? '',
        email: data.email || localStorage.getItem("trainer_email") || '',
        role: data.role ?? data.role_name ?? '',
        bio: data.bio ?? '',
        phone: data.phone || localStorage.getItem("trainer_phone") || '',
        address: data.address ?? data.location ?? localStorage.getItem("trainer_address") ?? '',
        expertise: data.expertise ?? '',
        linkedin: data.linkedin || localStorage.getItem("trainer_linkedin") || '',
        twitter: data.twitter ?? '',
        profile_picture: data.profile_picture ?? '',
        rating: data.rating != null ? String(data.rating) : '',
      };
    }
    return {
      name: '',
      email: localStorage.getItem("trainer_email") || '',
      role: '',
      bio: '',
      phone: localStorage.getItem("trainer_phone") || '',
      address: localStorage.getItem("trainer_address") || '',
      expertise: '',
      linkedin: localStorage.getItem("trainer_linkedin") || '',
      twitter: '',
      profile_picture: '',
      rating: '',
    };
  });
  const [profileLoading, setProfileLoading] = useState(() => !localStorage.getItem("trainer_profile"));
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Split Name for UI Inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Sync split name with profile name on load
  useEffect(() => {
    if (profile.name) {
      const parts = profile.name.trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [profile.name]);

  // ── Signature states ───────────────────────────────────────
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [currentSignatureUrl, setCurrentSignatureUrl] = useState<string | null>(null);
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [signatureFetching, setSignatureFetching] = useState(false);

  // ── Preferences States ──────────────────────────────────────
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefPush, setPrefPush] = useState(true);
  const [prefReports, setPrefReports] = useState(false);
  const [prefLang, setPrefLang] = useState('English');

  const getToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      fetchSignature();
    }
  }, [isOpen]);

  // ── Profile fetch & update (unchanged logic) ─────────────────────
  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const token = getToken();
      if (!token) {
        toast.error('Not authenticated');
        return;
      }
      const res = await fetch(`${API_BASE}/trainer/profile`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const updatedProfile = {
        success: true,
        name: data.name ?? '',
        email: data.email || localStorage.getItem("trainer_email") || '',
        role: data.role ?? data.role_name ?? '',
        bio: data.bio ?? '',
        phone: data.phone || localStorage.getItem("trainer_phone") || '',
        address: data.address ?? data.location ?? localStorage.getItem("trainer_address") ?? '',
        expertise: data.expertise ?? '',
        linkedin: data.linkedin || localStorage.getItem("trainer_linkedin") || '',
        twitter: data.twitter ?? '',
        profile_picture: data.profile_picture ?? '',
        rating: data.rating != null ? String(data.rating) : '',
      };
      setProfile(updatedProfile);
      localStorage.setItem("trainer_profile", JSON.stringify(updatedProfile));
    } catch (err) {
      console.error('Fetch profile failed:', err);
      toast.error('Could not load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!firstName.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (!profile.email.trim()) {
      toast.error('Email Address is required');
      return;
    }
    if (!profile.phone.trim()) {
      toast.error('Phone Number is required');
      return;
    }
    if (!profile.address.trim()) {
      toast.error('Address is required');
      return;
    }
    if (!profile.bio.trim()) {
      toast.error('Bio is required');
      return;
    }
    if (!profile.linkedin.trim()) {
      toast.error('LinkedIn URL is required');
      return;
    }
    if (!profile.linkedin.trim().startsWith('https://')) {
      toast.error('LinkedIn URL must start with https://');
      return;
    }

    setProfileLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('No access token found');

      const formData = new FormData();

      // Combine first & last name back into full name
      const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (combinedName) formData.append('name', combinedName);

      if (profile.bio && typeof profile.bio === 'string' && profile.bio.trim()) formData.append('bio', profile.bio.trim());
      if (profile.phone && typeof profile.phone === 'string' && profile.phone.trim()) formData.append('phone', profile.phone.trim());
      if (profile.expertise && typeof profile.expertise === 'string' && profile.expertise.trim()) formData.append('expertise', profile.expertise.trim());
      if (profile.linkedin && typeof profile.linkedin === 'string' && profile.linkedin.trim()) formData.append('linkedin', profile.linkedin.trim());
      if (profile.twitter && typeof profile.twitter === 'string' && profile.twitter.trim()) formData.append('twitter', profile.twitter.trim());
      if (profile.email && typeof profile.email === 'string' && profile.email.trim()) formData.append('email', profile.email.trim());

      if (profile.address && typeof profile.address === 'string' && profile.address.trim()) {
        localStorage.setItem("trainer_address", profile.address.trim());
        formData.append('address', profile.address.trim());
        formData.append('location', profile.address.trim());
      }

      const ratingTrimmed = (profile.rating && typeof profile.rating === 'string') ? profile.rating.trim() : '';
      if (ratingTrimmed) formData.append('rating', ratingTrimmed);

      if (imageFile) {
        formData.append('profile_picture', imageFile);
      }

      const res = await fetch(`${API_BASE}/trainer/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        if (profile.email) localStorage.setItem("trainer_email", String(profile.email).trim());
        if (profile.phone) localStorage.setItem("trainer_phone", String(profile.phone).trim());
        if (profile.address) localStorage.setItem("trainer_address", String(profile.address).trim());
        if (profile.linkedin) localStorage.setItem("trainer_linkedin", String(profile.linkedin).trim());
        toast.success('Profile updated successfully');
        setImageFile(null);
        await fetchProfile();
        window.dispatchEvent(new Event('profile-updated'));
      } else {
        let errorMessage = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          errorMessage = errData.detail?.[0]?.msg ?? errData.message ?? errData.detail ?? errorMessage;
        } catch { }
        toast.error(errorMessage);
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error while updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Password ───────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_BASE}/trainer/change-password`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        toast.success('Password changed successfully. Logging out...');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        localStorage.removeItem('trainer_profile');
        setTimeout(() => {
          logout();
          onClose();
        }, 1500);
      } else {
        let errorMessage = 'Failed to change password';
        try {
          const errData = await res.json();
          errorMessage = errData.detail?.[0]?.msg ?? errData.message ?? errData.detail ?? errorMessage;
        } catch { }
        toast.error(errorMessage);
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Signature Fetch & Upload ───────────────────────────
  const fetchSignature = async () => {
    setSignatureFetching(true);

    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/trainer/signature`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json, image/*',
        },
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 204) {
          return;
        }
        throw new Error(`GET /signature failed → ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';
      let url: string | null = null;

      if (contentType.includes('application/json')) {
        const data = await res.json();
        let path: string | undefined;

        for (const key of ['url', 'path', 'signature', 'file', 'key', 'location', 'filename']) {
          if (typeof data[key] === 'string' && data[key].trim()) {
            path = data[key].trim();
            break;
          }
        }

        if (!path && typeof data === 'string') {
          path = data.trim();
        }

        if (path) {
          if (path.startsWith('http://') || path.startsWith('https://')) {
            url = path;
          } else if (path.startsWith('/')) {
            url = `${API_BASE}${path}`;
          } else {
            const possiblePrefixes = [
              '/media/signatures/',
              '/static/signatures/',
              '/media/',
              '/uploads/',
              '/files/',
              '/signatures/',
            ];

            const matchedPrefix = possiblePrefixes.find(p => {
              const cleanPrefix = p.replace(/^\/|\/$/g, '');
              return path.startsWith(cleanPrefix);
            });

            if (matchedPrefix) {
              url = `${API_BASE}/${path}`;
            } else {
              url = path.includes('/') ? `${API_BASE}/${path}` : `${API_BASE}/media/signatures/${path}`;
            }
          }
        }
      } else {
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
      }

      if (url) {
        setCurrentSignatureUrl(url);
      }
    } catch (err) {
      console.error('fetchSignature failed:', err);
    } finally {
      setSignatureFetching(false);
    }
  };

  const handleUploadSignature = async () => {
    if (!signatureFile) {
      toast.error('Please select a signature file first');
      return;
    }
    setSignatureLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('signature', signatureFile);

      let res = await fetch(`${API_BASE}/trainer/signature`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok && (res.status === 409 || res.status === 400)) {
        res = await fetch(`${API_BASE}/trainer/signature`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      if (res.ok) {
        toast.success('Signature uploaded successfully');
        if (signatureFile) {
          setCurrentSignatureUrl(URL.createObjectURL(signatureFile));
        }
        setSignatureFile(null);
        await fetchSignature();
      } else {
        let msg = 'Failed to upload signature';
        try {
          const err = await res.json();
          msg = err.detail?.[0]?.msg ?? err.message ?? err.detail ?? msg;
        } catch { }
        toast.error(`${msg} (${res.status})`);
      }
    } catch {
      toast.error('Error uploading signature');
    } finally {
      setSignatureLoading(false);
    }
  };

  const handleDeleteSignature = async () => {
    if (!currentSignatureUrl) {
      toast.info('No signature to delete');
      return;
    }
    if (!window.confirm('Are you sure you want to delete your signature?')) return;

    setSignatureLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_BASE}/trainer/signature`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Signature deleted');
        setCurrentSignatureUrl(null);
      } else {
        toast.error('Failed to delete signature');
      }
    } catch {
      toast.error('Error deleting signature');
    } finally {
      setSignatureLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  };

  if (!isOpen) return null;

  // Determine avatar preview
  const previewUrl = imageFile
    ? URL.createObjectURL(imageFile)
    : profile.profile_picture
      ? profile.profile_picture.startsWith('http')
        ? profile.profile_picture
        : `${API_BASE}${profile.profile_picture.startsWith('/') ? '' : '/'}${profile.profile_picture}`
      : null;

  const userInitials = firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : profile.name
      ? profile.name.substring(0, 2).toUpperCase()
      : 'SJ';

  return (
    <div className="absolute inset-0 bg-gray-50 z-50 overflow-y-auto no-scrollbar p-2 md:p-3 flex flex-col">
      <div className="w-full space-y-6">
        {/* Header and Back navigation */}
        <div className="w-full flex items-center gap-4 mb-2">
          <button
            onClick={onClose}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm group shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-900 transition-colors" />
          </button>
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0F172A] leading-tight">My Profile</h1>
            <p className="text-[#64748B] text-[13.5px] mt-0.5">Manage and configure your personal and security credentials</p>
          </div>
        </div>

        {/* Main Grid Wrapper */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">

        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-4 space-y-6">

          {/* Main User Card */}
          <div className="bg-white border-[1.35px] border-[#E5E7EB] rounded-[22px] p-8 flex flex-col items-center shadow-sm relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.03),_transparent_45%)]">
            {/* Avatar Circle with upload action */}
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

            {/* User Bio */}
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

                {/* Role Badge */}
                <div className="mt-5 h-8 px-4 flex items-center justify-center text-[12px] font-bold text-[#6366F1] bg-[#EEF2FF] border border-[#E0E7FF] rounded-full">
                  {profile.role || "Instructor"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-8 space-y-6">

          {/* Card 1: Personal Information */}
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
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
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
                        setProfile(prev => ({ ...prev, phone: val }));
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
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your address"
                  maxLength={150}
                  className="pl-11 h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 focus-visible:ring-0 cursor-text"
                />
              </div>
            </div>

            {/* Additional Fields: Bio, Expertise, Rating */}
            <div className="py-5 border-t border-slate-100/90 my-5 space-y-5">
              <h4 className="text-[14.5px] font-bold text-[#0F172A]">Professional details</h4>

              <div className="space-y-2">
                <Label className="text-[13px] text-[#0F172A] font-semibold">Bio</Label>
                <Input
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
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
                    onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
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

          {/* Card 2: Security Settings */}
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

            {/* Alert banner */}
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

          {/* Card 3: Signature Settings */}
          <div className="bg-white border-[1.35px] border-[#E5E7EB] rounded-[22px] p-6 md:p-8 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center mr-3.5 shadow-sm">
                <PenTool className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-bold text-[17px] text-[#0F172A]">Signature Settings</h3>
                <p className="text-[12.5px] text-slate-400 font-medium mt-0.5">Manage and preview your signing signature</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <Label className="text-[13px] text-[#0F172A] font-semibold">Current Signature</Label>

              {signatureFetching ? (
                <div className="border border-dashed rounded-2xl p-8 text-center text-slate-400 animate-pulse bg-slate-50/50">
                  Loading signature...
                </div>
              ) : currentSignatureUrl ? (
                <div className="border-[1.35px] border-[#E5E7EB] rounded-2xl p-5 bg-[#F8FAFC] min-h-[140px] flex items-center justify-center relative overflow-hidden shadow-inner">
                  <img
                    src={currentSignatureUrl}
                    alt="Trainer signature"
                    className="max-h-32 w-auto object-contain transition-all"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-size="16" fill="%23999">Signature load failed</text></svg>';
                    }}
                  />
                </div>
              ) : (
                <div className="border border-dashed border-[#cbd5e1] rounded-2xl p-8 text-center text-slate-400 font-medium bg-[#F8FAFC]/50 italic">
                  No signature uploaded yet
                </div>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <Label className="text-[13px] text-[#0F172A] font-semibold">Upload / Replace Signature</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setSignatureFile(e.target.files?.[0] ?? null)}
                className="h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 file:bg-[#EEF2FF] file:text-[#6366F1] file:border-0 file:rounded-lg file:px-3 file:py-1 cursor-pointer pt-2"
              />
              {signatureFile && (
                <p className="text-[11.5px] text-[#10B981] font-semibold bg-[#ECFDF5] px-3 py-1 rounded-full inline-block mt-2">
                  Selected: {signatureFile.name} ({(signatureFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleUploadSignature}
                disabled={signatureLoading || !signatureFile || signatureFetching}
                className="flex-1 h-11 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-[13.5px] rounded-[14px] shadow-sm transition-all cursor-pointer"
              >
                {signatureLoading ? 'Uploading…' : 'Upload Signature'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSignature}
                disabled={signatureLoading || !currentSignatureUrl || signatureFetching}
                className="flex-1 h-11 bg-[#FF453A] hover:bg-[#E03E34] text-white font-bold text-[13.5px] rounded-[14px] shadow-sm transition-all cursor-pointer"
              >
                {signatureLoading ? 'Processing…' : 'Delete Signature'}
              </Button>
            </div>

            <p className="text-[11.5px] text-center text-slate-400 mt-4 font-medium">
              Supported formats: JPG, PNG, GIF, WEBP, PDF
            </p>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
};

export default ProfileModal;
