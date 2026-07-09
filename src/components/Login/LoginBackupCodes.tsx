import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface LoginBackupCodesProps {
  backupCodes: string[];
  handleDownloadBackupCodes: () => void;
  setStep: (step: 'login' | 'mfa' | 'enroll' | 'backup' | 'finalMfa') => void;
}

const LoginBackupCodes: React.FC<LoginBackupCodesProps> = ({
  backupCodes, handleDownloadBackupCodes, setStep
}) => {
  return (
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
          className="flex-1 h-[48px] md:h-[54px] rounded-[11px] border border-[#d3d3d3] bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold flex items-center justify-center gap-2 shadow-none"
        >
          <Download className="w-5 h-5 text-gray-500" />
          Download Codes
        </Button>
        <Button
          type="submit"
          className="flex-1 h-[48px] md:h-[54px] rounded-[11px] bg-gradient-to-r from-[#0d7df2] to-[#7430ec] text-white font-semibold shadow-none"
        >
          I have saved them
        </Button>
      </div>
    </form>
  );
};

export default LoginBackupCodes;
