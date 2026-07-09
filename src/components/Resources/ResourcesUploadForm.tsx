import React from 'react';
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Course } from './ResourcesTypes';

interface FormData {
  course_id: string;
  title: string;
  file_type: string;
  external_url: string;
  duration_seconds: string;
}

interface ResourcesUploadFormProps {
  isEdit: boolean;
  setShowForm: (val: boolean) => void;
  resetForm: () => void;
  handleSubmit: (e: any) => Promise<void>;
  handleChange: (e: any) => void;
  formData: FormData;
  courses: Course[];
  file: File | null;
  handleFileChange: (e: any) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
  loading: boolean;
}

const ResourcesUploadForm: React.FC<ResourcesUploadFormProps> = ({
  isEdit, setShowForm, resetForm, handleSubmit, handleChange, formData,
  courses, file, handleFileChange, handleDragOver, handleDragLeave,
  handleDrop, isDragging, loading
}) => {
  const getAcceptType = () => {
    switch (formData.file_type) {
      case "pdf": return ".pdf";
      case "doc": return ".doc,.docx";
      case "mp4": return ".mp4";
      default: return "*";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-[380px] w-full flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ background: 'linear-gradient(135deg, #F0F6FF 0%, #FAF5FF 100%)' }}>
          <h2 className="text-lg font-semibold text-blue-600">{isEdit ? "Update Resource" : "Add Resource"}</h2>
          <button
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto no-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Course</option>
                {courses.map((course) => {
                  const title = course.title || `Course #${course.id}`;
                  const displayTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
                  return (
                    <option key={course.id} value={course.id}>
                      {displayTitle} (ID: {course.id})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={30}
                placeholder="Enter title"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder:text-[13px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Type
              </label>
              <select
                name="file_type"
                value={formData.file_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Type</option>
                <option value="pdf">PDF</option>
                <option value="doc">DOC</option>
                <option value="mp4">MP4</option>
                <option value="url">URL</option>
              </select>
            </div>

            {formData.file_type === "url" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External URL
                </label>
                <Input
                  name="external_url"
                  value={formData.external_url}
                  onChange={handleChange}
                  placeholder="Enter URL"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            )}

            {formData.file_type &&
              formData.file_type !== "url" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="file"
                      accept={getAcceptType()}
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                          <Plus className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600">
                          {file ? file.name : "Drag & drop file or click to upload"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Accepts: {formData.file_type.toUpperCase()}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

            <Button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition mt-2"
              disabled={loading}
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Uploading..."
                : isEdit
                  ? "Update Resource"
                  : "Submit"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResourcesUploadForm;
