import React from 'react';
import { PenTool } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProfileSignatureCardProps {
  signatureFetching: boolean;
  currentSignatureUrl: string | null;
  signatureFile: File | null;
  setSignatureFile: (file: File | null) => void;
  handleUploadSignature: () => void;
  handleDeleteSignature: () => void;
  signatureLoading: boolean;
}

const ProfileSignatureCard: React.FC<ProfileSignatureCardProps> = ({
  signatureFetching,
  currentSignatureUrl,
  signatureFile,
  setSignatureFile,
  handleUploadSignature,
  handleDeleteSignature,
  signatureLoading,
}) => {
  return (
    <div className="bg-white border-[1.35px] border-[#E5E7EB] rounded-[22px] p-6 md:p-8 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center mr-3.5 shadow-sm">
          <PenTool className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="font-bold text-[17px] text-[#0F172A]">Signature Settings</h3>
          <p className="text-[12.5px] text-slate-400 font-medium mt-0.5">Manage and preview your signing signature</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <Label className="text-[13px] text-[#0F172A] font-semibold">Current Signature</Label>

        {signatureFetching ? (
          <div className="border border-dashed rounded-2xl p-8 text-center text-slate-400 animate-pulse bg-slate-50/50">
            Loading signature...
          </div>
        ) : currentSignatureUrl ? (
          <div className="border-[1.35px] border-[#E5E7EB] rounded-2xl p-5 bg-[#F8FAFC] min-h-[140px] flex items-center justify-center relative overflow-hidden shadow-inner">
            <img
              src={currentSignatureUrl}
              alt="Trainer signature"
              className="max-h-32 w-auto object-contain transition-all"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-size="16" fill="%23999">Signature load failed</text></svg>';
              }}
            />
          </div>
        ) : (
          <div className="border border-dashed border-[#cbd5e1] rounded-2xl p-8 text-center text-slate-400 font-medium bg-[#F8FAFC]/50 italic">
            No signature uploaded yet
          </div>
        )}
      </div>

      <div className="space-y-2 mb-6">
        <Label className="text-[13px] text-[#0F172A] font-semibold">Upload / Replace Signature</Label>
        <Input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setSignatureFile(e.target.files?.[0] ?? null)}
          className="h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 file:bg-[#EEF2FF] file:text-[#6366F1] file:border-0 file:rounded-lg file:px-3 file:py-1 cursor-pointer pt-2"
        />
        {signatureFile && (
          <p className="text-[11.5px] text-[#10B981] font-semibold bg-[#ECFDF5] px-3 py-1 rounded-full inline-block mt-2">
            Selected: {signatureFile.name} ({(signatureFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleUploadSignature}
          disabled={signatureLoading || !signatureFile || signatureFetching}
          className="flex-1 h-11 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-[13.5px] rounded-[14px] shadow-sm transition-all cursor-pointer"
        >
          {signatureLoading ? 'Uploading…' : 'Upload Signature'}
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeleteSignature}
          disabled={signatureLoading || !currentSignatureUrl || signatureFetching}
          className="flex-1 h-11 bg-[#FF453A] hover:bg-[#E03E34] text-white font-bold text-[13.5px] rounded-[14px] shadow-sm transition-all cursor-pointer"
        >
          {signatureLoading ? 'Processing…' : 'Delete Signature'}
        </Button>
      </div>

      <p className="text-[11.5px] text-center text-slate-400 mt-4 font-medium">
        Supported formats: JPG, PNG, GIF, WEBP, PDF
      </p>
    </div>
  );
};

export default ProfileSignatureCard;
