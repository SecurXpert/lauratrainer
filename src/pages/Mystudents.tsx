import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = "http://192.168.0.122:10000/trainer/my-students";

interface Student {
  id: number;
  name: string;
}

const Mystudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

 const fetchStudents = async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    toast.error("Please login again");
    return;
  }

  try {
    setLoading(true);

    const response = await axios.get(
      "http://192.168.0.122:10000/trainer/my-students",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Students:", response.data);
    setStudents(response.data);
  } catch (error: any) {
    console.error(error.response);
    toast.error("Unauthorized or session expired");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="p-6">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>My Students</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin h-6 w-6" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-center text-gray-500">
              No students found
            </p>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {students.map((student) => (
                  <Card
                    key={student.id}
                    className="flex items-center gap-4 p-4"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {student.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-semibold">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {student.id}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Mystudents;