import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
 
const API_BASE = 'http://192.168.0.122:10000';
 
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}
 
const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user } = useAuth();
 
  // ── Password states ────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
 
  // ── Profile states ─────────────────────────────────────────
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    phone: '',
    expertise: '',
    linkedin: '',
    twitter: '',
    profile_picture: '',
    rating: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
 
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
 
  // ── Profile fetch & update (unchanged) ─────────────────────
  const fetchProfile = async () => {
    try {
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
      setProfile({
        name: data.name ?? '',
        bio: data.bio ?? '',
        phone: data.phone ?? '',
        expertise: data.expertise ?? '',
        linkedin: data.linkedin ?? '',
        twitter: data.twitter ?? '',
        profile_picture: data.profile_picture ?? '',
        rating: data.rating != null ? String(data.rating) : '',
      });
    } catch (err) {
      console.error('Fetch profile failed:', err);
      toast.error('Could not load profile');
    }
  };
 
  const handleUpdateProfile = async () => {
    setProfileLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('No access token found');
      const formData = new FormData();
      if (profile.name.trim()) formData.append('name', profile.name.trim());
      if (profile.bio.trim()) formData.append('bio', profile.bio.trim());
      if (profile.phone.trim()) formData.append('phone', profile.phone.trim());
      if (profile.expertise.trim()) formData.append('expertise', profile.expertise.trim());
      if (profile.linkedin.trim()) formData.append('linkedin', profile.linkedin.trim());
      if (profile.twitter.trim()) formData.append('twitter', profile.twitter.trim());
      const ratingTrimmed = profile.rating.trim();
      if (ratingTrimmed) formData.append('rating', ratingTrimmed);
      if (imageFile) {
        formData.append('profile_picture', imageFile);
      } else if (profile.profile_picture.trim()) {
        formData.append('profile_picture', profile.profile_picture.trim());
      }
      if (formData.entries().next().done) {
        toast.info('No changes to update');
        setProfileLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE}/trainer/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        toast.success('Profile updated successfully');
        setImageFile(null);
        await fetchProfile();
      } else {
        let errorMessage = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          errorMessage = errData.detail?.[0]?.msg ?? errData.message ?? errData.detail ?? errorMessage;
        } catch {}
        toast.error(errorMessage);
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error while updating profile');
    } finally {
      setProfileLoading(false);
    }
  };
 
  // ── Password (unchanged) ───────────────────────────────────
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
      if (!token) throw new Error('No token');
      const res = await fetch(`${API_BASE}/trainer/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      if (res.ok) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.detail?.[0]?.msg ?? errData.message ?? 'Failed to change password';
        toast.error(msg);
      }
    } catch {
      toast.error('Network error while changing password');
    } finally {
      setPasswordLoading(false);
    }
  };
 
  // ── Signature – improved parsing & relative path fix ───────
const fetchSignature = async () => {
  setSignatureFetching(true);
  setCurrentSignatureUrl(null);
 
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
 
    // ── Case 1: Server returns the image directly ───────────────
    if (contentType.startsWith('image/') || contentType === 'application/pdf') {
      const blob = await res.blob();
      url = URL.createObjectURL(blob);
    }
 
    // ── Case 2: Server returns JSON with path / url / filename ──
    else if (contentType.includes('application/json')) {
      const data = await res.json();
 
      let path: string | undefined;
 
      // Try common key names – add more if your backend uses something else
      for (const key of ['url', 'path', 'signature', 'file', 'key', 'location', 'filename']) {
        if (typeof data[key] === 'string' && data[key].trim()) {
          path = data[key].trim();
          break;
        }
      }
 
      // If we didn't find anything meaningful, try raw string response
      if (!path && typeof data === 'string') {
        path = data.trim();
      }
 
      if (path) {
        // Normalize URL
        if (path.startsWith('http://') || path.startsWith('https://')) {
          url = path;
        } else if (path.startsWith('/')) {
          url = `${API_BASE}${path}`;
        } else {
          // most common case: just "filename.png" or "signatures/abc.png"
          // Try these popular media folders in order
          const possiblePrefixes = [
            '/media/',
            '/uploads/',
            '/static/signatures/',
            '/files/',
            '/signatures/',
            '/media/signatures/',
          ];
 
          for (const prefix of possiblePrefixes) {
            const candidate = `${API_BASE}${prefix}${path.replace(/^\//, '')}`;
            // We'll pick the first one – you can test manually in browser
            url = candidate;
            break; // ← comment this out and log all candidates if needed
          }
        }
      }
    }
 
    if (url) {
      console.log('[Signature] Constructed URL →', url);
      setCurrentSignatureUrl(url);
    } else {
      console.warn('[Signature] Could not extract usable URL from response');
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
        setSignatureFile(null);
        await fetchSignature();
      } else {
        let msg = 'Failed to upload signature';
        try {
          const err = await res.json();
          msg = err.detail?.[0]?.msg ?? err.message ?? err.detail ?? msg;
        } catch {}
        toast.error(`${msg} (${res.status})`);
      }
    } catch {
      toast.error('Network error while uploading signature');
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
        toast.error(`Failed to delete signature (${res.status})`);
      }
    } catch {
      toast.error('Network error while deleting signature');
    } finally {
      setSignatureLoading(false);
    }
  };
 
  const updateField = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>
 
        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
          </TabsList>
 
          {/* Profile Tab – unchanged */}
          <TabsContent value="profile" className="space-y-5 pt-6">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={profile.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Input value={profile.bio} onChange={(e) => updateField('bio', e.target.value)} placeholder="Short description about yourself" />
            </div>
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <Input
                value={profile.rating}
                onChange={(e) => updateField('rating', e.target.value)}
                placeholder="e.g. 4.8"
                type="number"
                step="0.1"
                min="0"
                max="5"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={profile.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91 99999 99999" />
            </div>
            <div className="space-y-1.5">
              <Label>Expertise</Label>
              <Input value={profile.expertise} onChange={(e) => updateField('expertise', e.target.value)} placeholder="Python, React, Strength Training, ..." />
            </div>
            <div className="space-y-1.5">
              <Label>LinkedIn</Label>
              <Input value={profile.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
            </div>
            <div className="space-y-1.5">
              <Label>Twitter / X</Label>
              <Input value={profile.twitter} onChange={(e) => updateField('twitter', e.target.value)} placeholder="https://x.com/yourhandle" />
            </div>
            <div className="space-y-1.5">
              <Label>Upload Profile Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImageFile(file);
                  if (file) updateField('profile_picture', '');
                }}
              />
              {imageFile && <p className="text-xs text-muted-foreground">Selected: {imageFile.name}</p>}
            </div>
            <Button onClick={handleUpdateProfile} className="w-full mt-6" disabled={profileLoading}>
              {profileLoading ? 'Updating…' : 'Update Profile'}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Email and role cannot be changed here
            </p>
          </TabsContent>
 
          {/* Password Tab – unchanged */}
          <TabsContent value="password" className="space-y-5 pt-6">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={passwordLoading} />
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={passwordLoading} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={passwordLoading} />
            </div>
            <Button onClick={handleChangePassword} className="w-full mt-6" disabled={passwordLoading}>
              {passwordLoading ? 'Updating…' : 'Change Password'}
            </Button>
          </TabsContent>
 
          {/* Signature Tab – with debug + better display */}
          <TabsContent value="signature" className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Current Signature</Label>
 
              {signatureFetching ? (
                <div className="border rounded-md p-6 text-center text-muted-foreground animate-pulse">
                  Loading signature...
                </div>
              ) : currentSignatureUrl ? (
                <div className="border rounded-md p-4 bg-muted/40 min-h-[120px] flex items-center justify-center relative">
                  <img
                    src={currentSignatureUrl}
                    alt="Trainer signature"
                    className="max-h-48 w-auto object-contain"
                    onError={(e) => {
                      console.warn('Signature image failed to load:', currentSignatureUrl);
                      e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-size="16" fill="%23999">Signature load failed</text></svg>';
                      e.currentTarget.alt = 'Failed to load signature – check console';
                    }}
                    onLoad={() => console.log('Signature image loaded successfully:', currentSignatureUrl)}
                  />
                </div>
              ) : (
                <div className="border rounded-md p-8 text-center text-muted-foreground italic bg-muted/20">
                  No signature uploaded yet
                </div>
              )}
 
              {/* Debug helper – remove in production */}
              {currentSignatureUrl && (
                <p className="text-xs text-muted-foreground break-all mt-1">
                  URL: {currentSignatureUrl}
                </p>
              )}
            </div>
 
            <div className="space-y-1.5">
              <Label>Upload / Replace Signature</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setSignatureFile(e.target.files?.[0] ?? null)}
              />
              {signatureFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {signatureFile.name} ({(signatureFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
 
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleUploadSignature}
                disabled={signatureLoading || !signatureFile || signatureFetching}
                className="flex-1"
              >
                {signatureLoading ? 'Uploading…' : 'Upload Signature'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSignature}
                disabled={signatureLoading || !currentSignatureUrl || signatureFetching}
                className="flex-1"
              >
                {signatureLoading ? 'Processing…' : 'Delete Signature'}
              </Button>
            </div>
 
            <p className="text-sm text-center text-muted-foreground pt-2">
              Supported: jpg, png, gif, webp, pdf
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
 
export default ProfileModal;
 