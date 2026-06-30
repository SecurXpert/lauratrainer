import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { ArrowLeft, Loader2, Upload, Tag, FileText, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Quiz {
  id: number;
  title: string;
  course_id: number;
}

export default function BulkUpload() {
  const navigate = useNavigate();
  const location = useLocation();

  // Quizzes list from backend
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch quizzes on mount to populate the select dropdown
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axiosInstance.get("/trainer/quizzes");
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setQuizzes(data);
      } catch (err) {
        toast.error("Failed to fetch quizzes");
      }
    };
    fetchQuizzes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) {
      toast.error("Please select a quiz");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a CSV file");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("quiz_id", String(selectedQuizId));

    try {
      await axiosInstance.post("/trainer/upload-mcq-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Questions uploaded successfully!");
      navigate(`/quizzes/${selectedQuizId}/view`);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to upload bulk questions";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate("/quizzes");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2 md:p-3">
      <div className="w-full space-y-6">

        {/* Top Navigation & Header */}
        <div className="space-y-4">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-6 py-2.5 hover:bg-[#E5DBFF] text-[#7C3AED] font-semibold text-sm rounded-lg transition duration-150 cursor-pointer border-0 shadow-none"
          >
            <ArrowLeft className="w-4 h-4 text-[#7C3AED]" />
            Back to Quizzes
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 leading-tight">
                Bulk Upload CSV
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Upload multiple questions via CSV file
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleCancel}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={uploading || !selectedQuizId || !selectedFile}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-5 h-11 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* 2 Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column (Upload Details Form) */}
          <div className="lg:col-span-8 space-y-6">

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upload Details</h2>
              </div>

              {uploadError && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-medium">
                  {uploadError}
                </div>
              )}

              <div className="space-y-5">
                {/* Select Quiz */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Quiz ID</Label>
                  <select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    className="w-full mt-2 h-11 rounded-xl bg-slate-50 border-0 px-3 text-sm focus:bg-white focus:outline-none transition cursor-pointer text-slate-700 font-medium"
                  >
                    <option value="">Select Quiz</option>
                    {quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title} (ID: {q.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* CSV File Input */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700">CSV File <span className="text-red-500">*</span></Label>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="cursor-pointer bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-xl shadow-sm text-sm transition">
                      Choose File
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-slate-500 font-medium">
                      {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Upload Info & Quick Tips) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Upload Info Card */}
            <div className="bg-[#F3F6FF] rounded-2xl border border-blue-100/30 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <Upload className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Upload Info</h2>
              </div>

              <div className="space-y-4 text-sm font-medium">

                {/* Quiz ID */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
                  <span className="text-slate-500">Quiz ID</span>
                  <span className="text-slate-900 font-bold">
                    {selectedQuizId || "—"}
                  </span>
                </div>

                {/* File */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
                  <span className="text-slate-500">File</span>
                  <span className="text-slate-900 font-bold truncate max-w-[180px]">
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </span>
                </div>

                {/* Format */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Format</span>
                  <span className="text-slate-900 font-bold">CSV</span>
                </div>

              </div>

              {/* Quick Tips */}
              <div className="pt-4 border-t border-slate-200/50 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Quick Tips</h3>
                <ul className="space-y-3.5 text-sm font-medium text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                    <span>Select the quiz to upload questions to</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                    <span>Upload a valid CSV file with questions</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                    <span>CSV must include question, options, and correct answer</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
