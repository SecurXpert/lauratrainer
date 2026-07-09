import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginFinalMfaFormProps {
  otp: string;
  setOtp: (val: string) => void;
  loading: boolean;
  handleFinalLogin: () => void;
}

const LoginFinalMfaForm: React.FC<LoginFinalMfaFormProps> = ({
  otp, setOtp, loading, handleFinalLogin
}) => {
  return (
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
        className="h-[52px] md:h-[61px] rounded-[13px]"
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-[48px] md:h-[54px] rounded-[11px] bg-gradient-to-r from-[#0d7df2] to-[#7430ec]"
      >
        Complete Login
      </Button>
    </form>
  );
};

export default LoginFinalMfaForm;
