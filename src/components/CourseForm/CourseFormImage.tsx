import React from 'react';
import { Input } from "@/components/ui/input";
import { Upload, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "../../pages/services/api/api";

interface CourseFormImageProps {
  formDataImage: File | null;
  existingImage: string | null;
  onChangeImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CourseFormImage: React.FC<CourseFormImageProps> = ({
  formDataImage,
  existingImage,
  onChangeImage
}) => {
  return (
    <div className="bg-white border border-slate-250 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-[15px] font-semibold text-[#101828] mb-5 leading-tight">Course Image</h2>

      <div className="relative">
        <Input
          type="file"
          name="image"
          accept="image/*"
          onChange={onChangeImage}
          className="hidden"
          id="image-upload"
        />

        <label
          htmlFor="image-upload"
          className="w-full border border-dashed border-slate-300 rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 bg-white hover:bg-slate-50/50 hover:border-slate-400"
        >
          <Upload className="w-12 h-12 text-slate-400 mb-3" strokeWidth={2} />
          <p className="text-[17px] text-slate-600 font-medium mb-1">
            Drag and drop or click to upload
          </p>
          <p className="text-[15px] text-slate-400">
            PNG, JPG or WEBP (max. 5MB)
          </p>

          {formDataImage ? (
            <div className="mt-4 flex flex-col items-center gap-2">
              <img
                src={URL.createObjectURL(formDataImage)}
                alt="New Preview"
                className="w-32 h-32 object-cover rounded-xl border border-slate-200"
              />
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full text-[#10B981] font-bold text-[11.5px] max-w-xs truncate shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Selected: {formDataImage.name}</span>
              </div>
            </div>
          ) : existingImage ? (
            <div className="mt-4 flex flex-col items-center gap-2">
              <img
                src={
                  existingImage.startsWith("http")
                    ? existingImage
                    : `${API_BASE_URL}${existingImage.startsWith("/") ? "" : "/"}${existingImage}`
                }
                alt="Current Course"
                className="w-32 h-32 object-cover rounded-xl border border-slate-200"
              />
              <span className="text-[12.5px] text-slate-500 font-semibold">Current Course Image</span>
            </div>
          ) : null}
        </label>
      </div>
    </div>
  );
};

export default CourseFormImage;
