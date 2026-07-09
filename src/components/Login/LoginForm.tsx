import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email, setEmail, password, setPassword,
  showPassword, setShowPassword, loading, handleSubmit
}) => {
  return (
    <>
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-[28px] leading-tight font-semibold text-[#1f2937] mb-2 md:mb-3">
          Login
        </h1>
        <p className="text-base md:text-[18px] leading-[1.35] text-[#6f6f6f] font-normal">
          Enter your credentials to login your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5" autoComplete="off">
        <div className="space-y-2 md:space-y-3">
          <Label className="text-sm md:text-[16px] font-semibold text-black">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="off"
            className="h-[52px] md:h-[61px] rounded-[13px] border-[#d3d3d3] px-4 md:px-5 text-sm md:text-[16px] shadow-none focus-visible:ring-1 focus-visible:ring-[#2563eb]"
          />
        </div>

        <div className="space-y-2 md:space-y-3">
          <Label className="text-sm md:text-[16px] font-semibold text-black">
            Password<span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password"
              className="h-[52px] md:h-[61px] rounded-[13px] border-[#d3d3d3] pl-4 md:pl-5 pr-12 text-sm md:text-[16px] shadow-none focus-visible:ring-1 focus-visible:ring-[#2563eb] w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center p-1 rounded-md transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <Button
          className="w-full h-[48px] md:h-[54px] rounded-[11px] bg-gradient-to-r from-[#0d7df2] to-[#7430ec] text-white text-sm md:text-[16px] font-semibold shadow-[0_14px_28px_rgba(37,99,235,0.28)] hover:opacity-95"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Login'}
        </Button>
      </form>
    </>
  );
};

export default LoginForm;
