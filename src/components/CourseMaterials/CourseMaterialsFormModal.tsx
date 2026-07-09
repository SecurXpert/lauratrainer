import React, { ChangeEvent, FormEvent } from 'react';
import { X, Loader2, Plus } from "lucide-react";
import { MaterialFormData } from './CourseMaterialsTypes';

interface CourseMaterialsFormModalProps {
  showForm: boolean;
  isEditing: boolean;
  loadingAction: boolean;
  loadingModules: boolean;
  form: MaterialFormData;
  setForm: React.Dispatch<React.SetStateAction<MaterialFormData>>;
  fileName: string;
  courses: any[];
  resetForm: () => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const CourseMaterialsFormModal: React.FC<CourseMaterialsFormModalProps> = ({
  showForm,
  isEditing,
  loadingAction,
  loadingModules,
  form,
  setForm,
  fileName,
  courses,
  resetForm,
  handleSubmit,
  handleFileChange
}) => {
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-black/50">
      <div className="flex min-h-full items-end justify-center p-4 pb-10 sm:items-center sm:p-4 sm:py-8">
        <div
          className="flex min-h-0 w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl max-h-[calc(100dvh-4rem)] sm:max-h-[min(90dvh,44rem)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="material-modal-title"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6" style={{ background: 'linear-gradient(135deg, #F0F6FF 0%, #FAF5FF 100%)' }}>
            <h2 id="material-modal-title" className="min-w-0 text-base font-semibold text-blue-600 sm:text-lg">
              {isEditing ? "Edit Material" : "Add Material"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              disabled={loadingAction}
              className="shrink-0 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 no-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Select Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  id="courseId"
                  name="courseId"
                  value={form.courseId}
                  onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.target.value }))}
                  required
                  disabled={loadingAction}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm bg-white"
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

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter Title"
                  value={form.title}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, 25);
                    setForm((prev) => ({ ...prev, title: val }));
                  }}
                  maxLength={25}
                  required
                  disabled={loadingAction}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm"
                />
              </div>

              {/* Module ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="moduleId"
                    name="moduleId"
                    placeholder="e.g., 37"
                    value={form.moduleId}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 10);
                      setForm((prev) => ({ ...prev, moduleId: val }));
                    }}
                    maxLength={10}
                    required
                    disabled={loadingAction}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200 text-sm"
                  />
                  {loadingModules && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
              </div>


              {/* Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File
                </label>
                <div
                  onClick={() => !loadingAction && document.getElementById("file")?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors"
                >
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={loadingAction}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.md,image/*"
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mb-1">
                    <Plus className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-[13px] text-gray-600 font-medium text-center">
                    Drag & drop file or click to upload
                  </p>
                  <p className="text-[11px] text-gray-400 text-center mt-1">
                    {fileName !== "No file chosen" ? (fileName.length > 40 ? fileName.substring(0, 37) + "..." : fileName) : "Accepts: PDF, DOC, ZIP, Images"}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
                >
                  {loadingAction ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Uploading..."}
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMaterialsFormModal;
