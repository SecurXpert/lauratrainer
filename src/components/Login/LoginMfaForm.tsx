import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginMfaFormProps {
  useBackup: boolean;
  setUseBackup: (val: boolean) => void;
  otp: string;
  setOtp: (val: string) => void;
  backupCode: string;
  setBackupCode: (val: string) => void;
  loading: boolean;
  handleMfaVerify: () => void;
  startEnrollment: () => void;
}

const LoginMfaForm: React.FC<LoginMfaFormProps> = ({
  useBackup, setUseBackup, otp, setOtp, backupCode, setBackupCode,
  loading, handleMfaVerify, startEnrollment
}) => {
  return (
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
          className="h-[52px] md:h-[61px] rounded-[13px]"
        />
      ) : (
        <Input
          placeholder="Backup code"
          value={backupCode}
          onChange={(e) => setBackupCode(e.target.value)}
          className="h-[52px] md:h-[61px] rounded-[13px]"
        />
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-[48px] md:h-[54px] rounded-[11px] bg-gradient-to-r from-[#0d7df2] to-[#7430ec]"
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
  );
};

export default LoginMfaForm;
