import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginEnrollFormProps {
  qrImage: string;
  otp: string;
  setOtp: (val: string) => void;
  loading: boolean;
  handleEnrollVerify: () => void;
}

const LoginEnrollForm: React.FC<LoginEnrollFormProps> = ({
  qrImage, otp, setOtp, loading, handleEnrollVerify
}) => {
  return (
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
        className="h-[52px] md:h-[61px] rounded-[13px]"
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-[48px] md:h-[54px] rounded-[11px] bg-gradient-to-r from-[#0d7df2] to-[#7430ec]"
      >
        Verify Setup
      </Button>
    </form>
  );
};

export default LoginEnrollForm;
