import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { API_BASE_URL } from "../pages/services/api/api";
import ProfileAvatarCard from './Profile/ProfileAvatarCard';
import ProfileInfoCard from './Profile/ProfileInfoCard';
import ProfileSecurityCard from './Profile/ProfileSecurityCard';
import ProfileSignatureCard from './Profile/ProfileSignatureCard';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { logout } = useAuth();
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
      const res = await fetch(`${API_BASE_URL}/trainer/profile`, {
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
      const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (combinedName) formData.append('name', combinedName);

      if (profile.bio?.trim()) formData.append('bio', profile.bio.trim());
      if (profile.phone?.trim()) formData.append('phone', profile.phone.trim());
      if (profile.expertise?.trim()) formData.append('expertise', profile.expertise.trim());
      if (profile.linkedin?.trim()) formData.append('linkedin', profile.linkedin.trim());
      if (profile.twitter?.trim()) formData.append('twitter', profile.twitter.trim());
      if (profile.email?.trim()) formData.append('email', profile.email.trim());

      if (profile.address?.trim()) {
        localStorage.setItem("trainer_address", profile.address.trim());
        formData.append('address', profile.address.trim());
        formData.append('location', profile.address.trim());
      }

      const ratingTrimmed = profile.rating?.trim() || '';
      if (ratingTrimmed) formData.append('rating', ratingTrimmed);

      if (imageFile) {
        formData.append('profile_picture', imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/trainer/profile`, {
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

      const res = await fetch(`${API_BASE_URL}/trainer/change-password`, {
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

      const res = await fetch(`${API_BASE_URL}/trainer/signature`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json, image/*',
        },
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 204) {
          setCurrentSignatureUrl(null);
          return;
        }
        throw new Error(`GET /signature failed → ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';
      let url: string | null = null;

      if (contentType.includes('application/json')) {
        const data = await res.json();
        let path: string | null = null;

        const findImage = (obj: any): string | null => {
          if (typeof obj === 'string') {
            if (obj.match(/\.(png|jpg|jpeg|svg|webp|gif)/i)) return obj;
            if (obj.startsWith('http') || obj.startsWith('/media/') || obj.startsWith('/uploads/')) return obj;
          }
          if (typeof obj === 'object' && obj !== null) {
            for (const key of Object.keys(obj)) {
              const res = findImage(obj[key]);
              if (res) return res;
            }
          }
          return null;
        };

        path = findImage(data);
        if (!path && typeof data === 'string') {
          path = data.trim();
        }

        if (path) {
          if (path.startsWith('http://') || path.startsWith('https://')) {
            url = path;
          } else {
            const cleanPath = path.startsWith('/') ? path : `/${path}`;
            if (cleanPath.startsWith('/media/') || cleanPath.startsWith('/uploads/') || cleanPath.startsWith('/static/') || cleanPath.startsWith('/signatures/')) {
              url = `${API_BASE_URL}${cleanPath}`;
            } else {
              url = `${API_BASE_URL}/media/signatures${cleanPath}`;
            }
          }
        }
      } else {
        const blob = await res.blob();
        if (blob.size > 0) {
          url = URL.createObjectURL(blob);
        }
      }

      if (url) {
        setCurrentSignatureUrl(url);
      } else {
        setCurrentSignatureUrl(null);
      }
    } catch (err) {
      console.error('fetchSignature failed:', err);
      setCurrentSignatureUrl(null);
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

      let res = await fetch(`${API_BASE_URL}/trainer/signature`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok && (res.status === 409 || res.status === 400)) {
        res = await fetch(`${API_BASE_URL}/trainer/signature`, {
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

      const res = await fetch(`${API_BASE_URL}/trainer/signature`, {
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

  return (
    <div className="absolute inset-0 bg-gray-50 z-50 overflow-y-auto no-scrollbar p-2 md:p-3 flex flex-col">
      <div className="w-full space-y-6">
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

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
          <div className="lg:col-span-4 space-y-6">
            <ProfileAvatarCard 
              profile={profile}
              profileLoading={profileLoading}
              imageFile={imageFile}
              fileInputRef={fileInputRef}
              handleAvatarClick={handleAvatarClick}
              handleFileChange={handleFileChange}
              firstName={firstName}
              lastName={lastName}
            />
          </div>

          <div className="lg:col-span-8 space-y-6">
            <ProfileInfoCard 
              firstName={firstName}
              setFirstName={setFirstName}
              profile={profile}
              setProfile={setProfile}
              profileLoading={profileLoading}
              handleUpdateProfile={handleUpdateProfile}
            />

            <ProfileSecurityCard 
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              handleChangePassword={handleChangePassword}
              passwordLoading={passwordLoading}
              showCurrentPassword={showCurrentPassword}
              setShowCurrentPassword={setShowCurrentPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />

            <ProfileSignatureCard 
              signatureFetching={signatureFetching}
              currentSignatureUrl={currentSignatureUrl}
              signatureFile={signatureFile}
              setSignatureFile={setSignatureFile}
              handleUploadSignature={handleUploadSignature}
              handleDeleteSignature={handleDeleteSignature}
              signatureLoading={signatureLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
