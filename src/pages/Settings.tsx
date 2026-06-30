import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  // Password States
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(true);
  const [updating, setUpdating] = useState(false);

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password validation if they filled any password field
    if (passwords.current || passwords.new || passwords.confirm) {
      if (!passwords.current) {
        toast.error("Please enter your current password");
        return;
      }
      if (passwords.new.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
      if (passwords.new !== passwords.confirm) {
        toast.error("New password and confirm password do not match");
        return;
      }
    } else {
      // If no password fields are filled and they just clicked update
      toast.success("Security preferences updated successfully!");
      return;
    }

    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      toast.success("Security settings updated successfully!");
      // Clear password fields
      setPasswords({ current: "", new: "", confirm: "" });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-6 md:px-10">
      <div className="max-w-[1180px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">Settings</h1>
          <p className="text-slate-500 text-[15px] mt-1">Manage your account preferences</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleUpdateSecurity} className="space-y-6">

          {/* 1. Change Password Card */}
          <div className="bg-white rounded-[24px] p-6 md:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Change Password</h2>
            
            <div className="space-y-5">
              {/* Current Password */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm pr-12 h-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Password</Label>
                <Input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm h-auto"
                />
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm h-auto"
                />
              </div>
            </div>
          </div>

          {/* 2. Two-Factor Authentication Card */}
          <div className="bg-white rounded-[24px] p-6 md:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Two-Factor Authentication</h2>
            
            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-slate-50/50 hover:bg-[#F1F5F9]/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-[#10B981] shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm md:text-base">Enable 2FA</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security</p>
                </div>
              </div>
              <Switch
                checked={enable2FA}
                onCheckedChange={() => setEnable2FA(!enable2FA)}
                className="data-[state=checked]:bg-[#7C3AED]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={updating}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all h-[46px] shadow-[0_4px_12px_rgba(124,58,237,0.2)] disabled:opacity-70"
            >
              {updating ? "Saving Changes..." : "Update Security"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 px-7 py-3 rounded-xl font-semibold text-sm transition-all h-[46px] shadow-none"
            >
              Cancel
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
