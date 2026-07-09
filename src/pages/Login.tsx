import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
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

import LoginLeftPanel from '../components/Login/LoginLeftPanel';
import LoginForm from '../components/Login/LoginForm';
import LoginMfaForm from '../components/Login/LoginMfaForm';
import LoginEnrollForm from '../components/Login/LoginEnrollForm';
import LoginBackupCodes from '../components/Login/LoginBackupCodes';
import LoginFinalMfaForm from '../components/Login/LoginFinalMfaForm';

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
      <div className="w-full min-h-screen bg-white grid grid-cols-1 lg:landscape:grid-cols-[45%_55%]">

        {/* Left Image Section */}
        <LoginLeftPanel />

        {/* Right Login Section */}
        <div className="relative min-h-screen bg-white flex flex-col justify-start pt-12 sm:pt-16 md:pt-24 lg:landscape:justify-center lg:landscape:pt-0 px-4 sm:px-8 md:px-8 lg:landscape:px-16 xl:px-20 py-10 md:py-12 lg:landscape:py-0">
          <div className="w-full max-w-[610px] mx-auto">
            <div className="mb-6 md:mb-8 lg:mb-[40px]">
              <img
                src={logo}
                alt="Lauratek Logo"
                className="w-[100px] h-auto mx-auto"
              />
            </div>

            {step === 'login' && (
              <LoginForm 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                loading={loading}
                handleSubmit={handleSubmit}
              />
            )}

            {step === 'mfa' && (
              <LoginMfaForm 
                useBackup={useBackup}
                setUseBackup={setUseBackup}
                otp={otp}
                setOtp={setOtp}
                backupCode={backupCode}
                setBackupCode={setBackupCode}
                loading={loading}
                handleMfaVerify={handleMfaVerify}
                startEnrollment={startEnrollment}
              />
            )}

            {step === 'enroll' && (
              <LoginEnrollForm 
                qrImage={qrImage}
                otp={otp}
                setOtp={setOtp}
                loading={loading}
                handleEnrollVerify={handleEnrollVerify}
              />
            )}

            {step === 'backup' && (
              <LoginBackupCodes 
                backupCodes={backupCodes}
                handleDownloadBackupCodes={handleDownloadBackupCodes}
                setStep={setStep}
              />
            )}

            {step === 'finalMfa' && (
              <LoginFinalMfaForm 
                otp={otp}
                setOtp={setOtp}
                loading={loading}
                handleFinalLogin={handleFinalLogin}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;