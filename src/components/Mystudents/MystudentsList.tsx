import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Loader2 } from "lucide-react";
import { Student } from './MystudentsTypes';

interface MystudentsListProps {
  loading: boolean;
  filteredStudents: Student[];
  handleViewProfile: (student: Student) => void;
}

const MystudentsList: React.FC<MystudentsListProps> = ({
  loading, filteredStudents, handleViewProfile
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (filteredStudents.length === 0) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No students found</p>
          <p className="text-sm text-gray-400">
            Try adjusting your search or filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filteredStudents.map((student) => (
        <Card
          key={student.id}
          className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0 sm:gap-4 w-full">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Avatar */}
                <Avatar
                  className={`h-12 w-12 ${student.avatarColor || "bg-gradient-to-br from-indigo-600 to-purple-600"} shadow-xl shadow-purple-200 rounded-2xl shrink-0`}
                >
                  <AvatarFallback
                    className={`${student.avatarColor || "bg-gradient-to-br from-indigo-600 to-purple-600"} text-white text-sm font-semibold rounded-2xl`}
                  >
                    {student.initials ||
                      student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 truncate">
                      {student.name}
                    </h3>
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-medium ${student.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                          }`}
                      >
                        {student.status || "Active"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2.5 py-0.5 rounded-lg border font-medium bg-blue-50 text-blue-600 border-blue-200"
                      >
                        {student.category || "Frontend"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col xs:flex-row xs:items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{student.email}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider Line - Mobile Only */}
              <div className="w-full h-[1px] bg-slate-100/90 my-3.5 block sm:hidden" />

              {/* View Profile Button */}
              <div className="w-full sm:w-auto flex justify-end shrink-0">
                <Button
                  onClick={() => handleViewProfile(student)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 h-10 px-5 shadow-lg shadow-indigo-200 border-0 rounded-xl"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  View Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MystudentsList;
