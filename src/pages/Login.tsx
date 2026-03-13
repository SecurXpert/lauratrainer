 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
 
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
 
  const [step, setStep] = useState<Step>('login');
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 
  const [otp, setOtp] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
 
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string>('');
 
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
 
  const [isReenroll, setIsReenroll] = useState(false);
 
  const [loading, setLoading] = useState(false);
 
  /* ======================
             LOGIN
     ====================== */
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
 
    // DIRECT LOGIN
    if (res.access_token) {
      localStorage.setItem('access_token', res.access_token);
      toast.success('Login successful');
      navigate('/dashboard', { replace: true });
      return;
    }
 
    // MFA REQUIRED
    if (res.temp_token) {
      setTempToken(res.temp_token);
      setStep('mfa');
      toast.info('Enter your 2FA code');
    }
  };
 
  /* ======================
     MFA VERIFY
     ====================== */
  const handleMfaVerify = async () => {
    if (!tempToken) return;
 
    setLoading(true);
 
    // Backup → re-enroll
    if (useBackup && backupCode.trim()) {
      const res = await reenrollStart(tempToken, backupCode.trim());
      setLoading(false);
 
      if (!res.success) {
        toast.error(res.error || 'Invalid backup code');
        return;
      }
 
      setIsReenroll(true);
      const qr = await reenrollQr(res.token || tempToken);
      if (qr.success) {
        setQrImage(qr.qr_image);
        setStep('enroll');
      }
      return;
    }
 
    // Normal MFA
    const res = await verifyLoginMfa({
      temp_token: tempToken,
      code: otp,
    });
 
    setLoading(false);
 
    if (!res.success) {
      toast.error(res.message || 'Invalid code');
      return;
    }
 
    localStorage.setItem('access_token', res.access_token);
    toast.success('Welcome back!');
    navigate('/dashboard', { replace: true });
  };
 
  /* ======================
     START ENROLLMENT
     ====================== */
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
 
  /* ======================
     VERIFY ENROLLMENT
     ====================== */
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
 
  /* ======================
     FINAL MFA LOGIN
     ====================== */
  const handleFinalLogin = async () => {
    if (!tempToken || otp.length !== 6) return;
 
    setLoading(true);
 
    const res = await verifyLoginMfa({
      temp_token: tempToken,
      code: otp,
    });
 
    setLoading(false);
 
    if (!res.success) {
      toast.error(res.message || 'Invalid code');
      return;
    }
 
    localStorage.setItem('access_token', res.access_token);
    toast.success('Login successful');
    // navigate('/dashboard');
    navigate('/dashboard', { replace: true });
  };
 
  /* ======================
     UI (MINIMAL SWITCH)
     ====================== */
  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-medium p-8">
 
        <div className="flex justify-center mb-6">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
 
        {step === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        )}
 
        {step === 'mfa' && (
          <div className="space-y-4">
            {!useBackup ? (
              <Input
                placeholder="6-digit code"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            ) : (
              <Input
                placeholder="Backup code"
                value={backupCode}
                onChange={e => setBackupCode(e.target.value)}
              />
            )}
 
            <Button onClick={handleMfaVerify} disabled={loading}>
              Verify
            </Button>
 
            <button onClick={() => setUseBackup(!useBackup)} className="text-sm text-primary">
              {useBackup ? 'Use authenticator app' : 'Use backup code'}
            </button>
 
            <button onClick={startEnrollment} className="text-sm text-primary block">
              First time? Set up 2FA
            </button>
          </div>
        )}
 
        {step === 'enroll' && (
          <div className="space-y-4 text-center">
            {qrImage && <img src={qrImage} className="mx-auto w-48" alt="Scan this QR with your authenticator app" />}
            <Input
              placeholder="6-digit code"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <Button onClick={handleEnrollVerify} disabled={loading}>
              Verify Setup
            </Button>
          </div>
        )}
 
        {step === 'backup' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Backup Codes</h3>
            <p className="text-sm text-muted-foreground">
              Save these codes in a safe place. You can use them if you lose access to your authenticator app.
            </p>
            <ul className="list-disc pl-4 space-y-1">
              {backupCodes.map((code, i) => (
                <li key={i} className="text-sm">{code}</li>
              ))}
            </ul>
            <Button onClick={() => setStep('finalMfa')} className="w-full">
              I have saved them
            </Button>
          </div>
        )}
 
        {step === 'finalMfa' && (
          <div className="space-y-4">
            <Input
              placeholder="6-digit code"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <Button onClick={handleFinalLogin} disabled={loading}>
              Complete Login
            </Button>
          </div>
        )}
 
      </div>
    </div>
  );
};
 
export default Login;
 