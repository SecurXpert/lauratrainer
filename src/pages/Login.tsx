import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Download } from 'lucide-react';

import logo from '@/assets/lauratek.png';

import {
  login as loginApi,
  verifyLoginMfa,
  enrollStart,
  enrollQr,
  verifyMfaCode,
  reenrollStart,
  reenrollQr,
} from '@/api/authApi';

type Step = 'login' | 'mfa' | 'enroll' | 'backup' | 'finalMfa';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);

  // Persist tempToken in sessionStorage so it survives any unexpected remount
  const [tempToken, setTempTokenState] = useState<string | null>(() => {
    return sessionStorage.getItem('mfa_temp_token') || null;
  });
  const setTempToken = (token: string | null) => {
    setTempTokenState(token);
    if (token) {
      sessionStorage.setItem('mfa_temp_token', token);
    } else {
      sessionStorage.removeItem('mfa_temp_token');
    }
  };

  const [qrImage, setQrImage] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isReenroll, setIsReenroll] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const res = await loginApi({ email, password });
    setLoading(false);

    if (!res.success) {
      toast.error(res.message || 'Invalid credentials');
      return;
    }

    if (res.access_token) {
      localStorage.setItem('access_token', res.access_token);
      localStorage.removeItem('trainer_profile');
      window.dispatchEvent(new Event('storage'));
      toast.success('Login successful');
      navigate('/dashboard', { replace: true });
      return;
    }

    if (res.temp_token) {
      setTempToken(res.temp_token);
      setStep('mfa');
      toast.info('Enter your 2FA code');
    } else if (!res.access_token) {
      toast.error(res.detail || res.message || 'Login failed');
    }
  };

  const handleMfaVerify = async () => {
    if (!tempToken) {
      toast.error('Session expired. Please login again.');
      setStep('login');
      return;
    }

    setLoading(true);

    if (useBackup && backupCode.trim()) {
      const res = await reenrollStart(tempToken, backupCode.trim());
      setLoading(false);

      if (!res.success) {
        // If server says MFA is not enrolled yet, redirect to fresh setup
        if (res.mfa_not_enabled) {
          toast.info('MFA not set up yet. Starting fresh setup...');
          setIsReenroll(false);
          setOtp('');
          setBackupCode('');
          await startEnrollment();
          return;
        }
        toast.error(res.error || res.detail || res.message || 'Invalid backup code');
        return;
      }

      setIsReenroll(true);
      // Server may return a new token after verifying backup code
      if (res.token) setTempToken(res.token);
      setOtp('');
      const qr = await reenrollQr(res.token || tempToken);
      if (qr.success) {
        setQrImage(qr.qr_image);
        setStep('enroll');
      } else {
        toast.error(qr.message || 'Failed to load QR code');
      }
      return;
    }

    // Authenticator app: require exactly 6 digits
    if (!useBackup && otp.length !== 6) {
      setLoading(false);
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    const res = await verifyLoginMfa({
      temp_token: tempToken,
      code: otp,
    });

    setLoading(false);

    if (!res.success) {
      // Show the actual server error (detail field), not a generic message
      toast.error(res.detail || res.message || 'Invalid or expired code');
      return;
    }

    setTempToken(null); // clear session storage token on success
    localStorage.setItem('access_token', res.access_token);
    localStorage.removeItem('trainer_profile');
    window.dispatchEvent(new Event('storage'));
    toast.success('Welcome back!');
    navigate('/dashboard', { replace: true });
  };

  const startEnrollment = async () => {
    if (!tempToken) return;

    setLoading(true);

    const res = await enrollStart({ token: tempToken });
    if (!res.success) {
      setLoading(false);
      toast.error(res.message || 'Enrollment failed');
      return;
    }

    setIsReenroll(false);
    const qr = await enrollQr(tempToken);
    setLoading(false);

    if (qr.success) {
      setQrImage(qr.qr_image);
      setStep('enroll');
    }
  };

  const handleEnrollVerify = async () => {
    if (!tempToken || otp.length !== 6) return;

    setLoading(true);
    const res = await verifyMfaCode(tempToken, otp, isReenroll);
    setLoading(false);

    if (!res.success) {
      toast.error(res.error || 'Invalid code');
      return;
    }

    toast.success('2FA setup complete');
    setBackupCodes(res.backup_codes || []);
    setOtp('');
    setStep(res.backup_codes?.length ? 'backup' : 'finalMfa');
  };

  const handleFinalLogin = async () => {
    if (!tempToken || otp.length !== 6) return;

    setLoading(true);

    const res = await verifyLoginMfa({
      temp_token: tempToken,
      code: otp,
    });

    setLoading(false);

    if (!res.success) {
      toast.error(res.detail || res.message || 'Invalid or expired code');
      return;
    }

    setTempToken(null); // clear session storage token on success
    localStorage.setItem('access_token', res.access_token);
    localStorage.removeItem('trainer_profile');
    window.dispatchEvent(new Event('storage'));
    toast.success('Login successful');
    navigate('/dashboard', { replace: true });
  };

  const handleDownloadBackupCodes = () => {
    try {
      const trainerProfileStr = localStorage.getItem('trainer_profile');
      let userName = '';
      try {
        if (trainerProfileStr) {
          const profile = JSON.parse(trainerProfileStr);
          userName = profile.name || profile.full_name || profile.username || '';
        }
      } catch (e) {
        console.error(e);
      }
      
      if (!userName) {
        const prefix = email.split('@')[0];
        userName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }

      const textContent = `Lauratek Backup Codes\nUser Name: ${userName}\nUser Email: ${email}\nGenerated at: ${new Date().toLocaleString()}\n\n` + 
        backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n');
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `lauratek-backup-codes-${safeUserName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Backup codes downloaded successfully');
    } catch (err) {
      toast.error('Failed to download backup codes');
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      <div className="w-full min-h-screen bg-white grid grid-cols-1 lg:grid-cols-[45%_55%]">

        {/* Left Image Section */}
        <div className="hidden lg:flex flex-col h-screen sticky top-0">
          <div className="h-[55%] w-full">
            <img
              src="/login.png"
              alt="Login illustration"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="h-[45%] bg-gradient-to-br from-[#006fe8] via-[#3158f4] to-[#7b2ff7] flex items-center justify-center px-[58px]">
            <div className="relative w-full max-w-[470px] bg-[#1c2f8f]/35 backdrop-blur-[1px] px-8 py-8 border-l-[7px] border-white">
              <h2 className="text-white text-[28px] font-semibold leading-tight mb-3">
                Welcome To Lauratek
              </h2>
              <p className="text-white text-[18px] leading-[1.5] font-medium">
                A powerful platform designed to streamline learning, assessments,
                and student success with a modern, centralized experience.
              </p>
            </div>
          </div>
        </div>

        {/* Right Login Section */}
        <div className="relative min-h-screen bg-white flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-12 lg:py-0">
          <div className="w-full max-w-[610px] mx-auto">
            <div className="mb-10 lg:mb-[40px]">
              <img
                src={logo}
                alt="Lauratek Logo"
                className="w-[100px] h-auto mx-auto"
              />
            </div>

            {step === 'login' && (
              <>
                <div className="mb-6">
                  <h1 className="text-[28px] leading-tight font-semibold text-[#1f2937] mb-3">
                    Login
                  </h1>
                  <p className="text-[18px] leading-[1.35] text-[#6f6f6f] font-normal">
                    Enter your credentials to login your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                  <div className="space-y-4">
                    <Label className="text-[16px] font-semibold text-black">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      autoComplete="off"
                      className="h-[61px] rounded-[13px] border-[#d3d3d3] px-5 text-[16px] shadow-none focus-visible:ring-1 focus-visible:ring-[#2563eb]"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[16px] font-semibold text-black">
                      Password<span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        className="h-[61px] rounded-[13px] border-[#d3d3d3] pl-5 pr-12 text-[16px] shadow-none focus-visible:ring-1 focus-visible:ring-[#2563eb] w-full"
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
                    className="w-full h-[54px] rounded-[11px] bg-gradient-to-r from-[#0d7df2] to-[#7430ec] text-white text-[16px] font-semibold shadow-[0_14px_28px_rgba(37,99,235,0.28)] hover:opacity-95"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Login'}
                  </Button>
                </form>
              </>
            )}

            {step === 'mfa' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleMfaVerify();
                }}
                className="space-y-4"
              >
                {!useBackup ? (
                  <Input
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    className="h-[61px] rounded-[13px]"
                  />
                ) : (
                  <Input
                    placeholder="Backup code"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    className="h-[61px] rounded-[13px]"
                  />
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] rounded-[11px] bg-gradient-to-r from-[#0d7df2] to-[#7430ec]"
                >
                  Verify
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setUseBackup(!useBackup);
                    setOtp('');
                    setBackupCode('');
                  }}
                  className="text-sm text-[#2563eb] block"
                >
                  {useBackup ? 'Use authenticator app' : 'Use backup code'}
                </button>

                <button
                  type="button"
                  onClick={startEnrollment}
                  className="text-sm text-[#2563eb] block"
                >
                  First time? Set up 2FA
                </button>
              </form>
            )}

            {step === 'enroll' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEnrollVerify();
                }}
                className="space-y-4 text-center"
              >
                {qrImage && (
                  <img
                    src={qrImage}
                    className="mx-auto w-48"
                    alt="Scan this QR with your authenticator app"
                  />
                )}
                <Input
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="h-[61px] rounded-[13px]"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] rounded-[11px] bg-gradient-to-r from-[#0d7df2] to-[#7430ec]"
                >
                  Verify Setup
                </Button>
              </form>
            )}

            {step === 'backup' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep('finalMfa');
                }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium">Backup Codes</h3>
                <p className="text-sm text-muted-foreground">
                  Save these codes in a safe place. You can use them if you lose
                  access to your authenticator app.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  {backupCodes.map((code, i) => (
                    <li key={i} className="text-sm">
                      {code}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={handleDownloadBackupCodes}
                    className="flex-1 h-[54px] rounded-[11px] border border-[#d3d3d3] bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold flex items-center justify-center gap-2 shadow-none"
                  >
                    <Download className="w-5 h-5 text-gray-500" />
                    Download Codes
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-[54px] rounded-[11px] bg-gradient-to-r from-[#0d7df2] to-[#7430ec] text-white font-semibold shadow-none"
                  >
                    I have saved them
                  </Button>
                </div>
              </form>
            )}

            {step === 'finalMfa' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFinalLogin();
                }}
                className="space-y-4"
              >
                <Input
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="h-[61px] rounded-[13px]"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] rounded-[11px] bg-gradient-to-r from-[#0d7df2] to-[#7430ec]"
                >
                  Complete Login
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;