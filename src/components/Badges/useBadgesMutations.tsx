import { useState } from "react";
import { toast } from "sonner";
import { api } from "./api";
import { Badge } from "./Types";

export const useBadgesMutations = (
  selectedCourseId: string, 
  setBadges: (b: Badge[]) => void, 
  setLoading: (l: boolean) => void,
  setIsCreateModalOpen: (o: boolean) => void,
  setIsEvaluateModalOpen: (o: boolean) => void,
  selectedBadgeIdForEval: string,
  selectedStudentId: string,
  setSelectedStudentId: (id: string) => void,
  setSelectedBadgeIdForEval: (id: string) => void
) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon_url: "",
    rule: "{}",
    additionalProp1: "{}",
    is_active: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const parseJsonSafely = (str: string, fieldName: string): any => {
    const trimmed = str.trim();
    if (!trimmed || trimmed === "{}") return {};
    try {
      return JSON.parse(trimmed);
    } catch (err: any) {
      toast.error(`Invalid JSON in "${fieldName}" field: ${err.message}`);
      throw err;
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return toast.error("Please select a course first");
    if (!formData.name.trim()) return toast.error("Badge name is required");

    let ruleObj: any;
    let additionalObj: any;
    try {
      ruleObj = parseJsonSafely(formData.rule, "Rule");
      additionalObj = parseJsonSafely(formData.additionalProp1, "Additional Properties");
    } catch { return; }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      icon_url: formData.icon_url.trim() || undefined,
      rule: ruleObj,
      additionalProp1: additionalObj,
      is_active: formData.is_active,
    };

    try {
      setLoading(true);
      await api.post(`/courses/${selectedCourseId}/badges`, payload);
      toast.success("Badge created successfully!");
      setIsCreateModalOpen(false);
      setFormData({ name: "", description: "", icon_url: "", rule: "{}", additionalProp1: "{}", is_active: true });
      const res = await api.get<Badge[]>(`/courses/${selectedCourseId}/badges`);
      setBadges(res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create badge");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return toast.error("No course selected");
    if (!selectedBadgeIdForEval) return toast.error("Please select a badge");
    if (!selectedStudentId) return toast.error("Please select a student");

    try {
      setLoading(true);
      const url = `/courses/${selectedCourseId}/badges/${selectedBadgeIdForEval}/evaluate/${selectedStudentId}`;
      await api.post(url);
      toast.success("Badge successfully evaluated for the student!");
      setIsEvaluateModalOpen(false);
      setSelectedStudentId("");
      setSelectedBadgeIdForEval("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to evaluate badge");
    } finally {
      setLoading(false);
    }
  };

  return { formData, setFormData, handleInputChange, handleCreateSubmit, handleEvaluateSubmit };
};
