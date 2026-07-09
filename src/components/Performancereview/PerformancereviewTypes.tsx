export interface Student {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  title: string;
}

export interface Review {
  id: number;
  review_text: string;
  student_name: string;
  instructor_name: string;
  created_at: string;
}

export const getInitials = (name: string) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getTagsFromReview = (text: string) => {
  const textLower = text.toLowerCase();
  const tags = [];
  if (textLower.includes("excellent") || textLower.includes("great") || textLower.includes("good")) tags.push("Excellent");
  if (textLower.includes("fast") || textLower.includes("quick")) tags.push("Fast Learner");
  if (textLower.includes("improve") || textLower.includes("needs work") || textLower.includes("struggle")) tags.push("Needs Improvement");
  if (textLower.includes("hard") || textLower.includes("effort") || textLower.includes("dedicated")) tags.push("Hard Worker");

  if (tags.length === 0) tags.push("Feedback Provided");

  return tags.slice(0, 2);
};
