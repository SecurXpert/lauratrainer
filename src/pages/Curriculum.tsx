// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "sonner";

// const COURSE_API = "http://192.168.0.122:10000/trainer/courses";
// const STUDENT_API = "http://192.168.0.122:10000/trainer/my-students";
// const BASE_API = "http://192.168.0.122:10000";

// const Curriculum = () => {
//   const token = localStorage.getItem("access_token");

//   const [courses, setCourses] = useState<any[]>([]);
//   const [students, setStudents] = useState<any[]>([]);
//   const [curriculumList, setCurriculumList] = useState<any[]>([]);
//   const [editModuleId, setEditModuleId] = useState<number | null>(null);


//   const [selectedCourseId, setSelectedCourseId] = useState("");
//   const [selectedProgressCourseId, setSelectedProgressCourseId] = useState("");
//   const [selectedStudentId, setSelectedStudentId] = useState("");

//   const [progressData, setProgressData] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [editId, setEditId] = useState<number | null>(null);

//   const [formData, setFormData] = useState({
//     course_id: "",
//     title: "",
//     description: "",
//     order_index: 0,
//     is_active: true,
//   });


 
 
 

  // /* ================= FETCH COURSES ================= */
  // const fetchCourses = async () => {
  //   try {
  //     const res = await fetch(COURSE_API, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     if (!res.ok) throw new Error("Courses fetch failed");

  //     const data = await res.json();
  //     setCourses(Array.isArray(data) ? data : data?.data || []);
  //   } catch (error) {
  //     toast.error("Failed to fetch courses");
  //   }
  // };

  // useEffect(() => {
  //   fetchCourses();
  // }, []);

  // /* ================= GET CURRICULUM ================= */
  // const handleGetCurriculum = async () => {
  //   if (!selectedCourseId) {
  //     toast.error("Please select course");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const res = await fetch(
  //       `${BASE_API}/courses/trainer/${selectedCourseId}/curriculum`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (!res.ok) throw new Error("Failed to fetch curriculum");

  //     const data = await res.json();
  //     setCurriculumList(Array.isArray(data) ? data : []);
  //   } catch (error) {
  //     toast.error("Failed to fetch curriculum");
  //     setCurriculumList([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // /* ================= HANDLE INPUT ================= */
  // const handleChange = (e: any) => {
  //   const { name, value } = e.target;

  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]:
  //       name === "order_index"
  //         ? Number(value)
  //         : name === "is_active"
  //         ? value === "true"
  //         : value,
  //   }));
  // };

  // /* ================= CREATE OR UPDATE ================= */
  // const handleSubmit = async (e: any) => {
  //   e.preventDefault();

  //   if (!formData.course_id) {
  //     toast.error("Please select course");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const url = editModuleId
  //       ? `${BASE_API}/courses/${formData.course_id}/curriculum/${editModuleId}`
  //       : `${BASE_API}/courses/${formData.course_id}/curriculum`;

  //     const method = editModuleId ? "PUT" : "POST";

  //     const res = await fetch(url, {
  //       method,
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         title: formData.title,
  //         description: formData.description,
  //         order_index: formData.order_index,
  //         is_active: formData.is_active,
  //       }),
  //     });

  //     if (!res.ok) throw new Error("Failed to save curriculum");

  //     toast.success(
  //       editModuleId
  //         ? "Curriculum updated successfully"
  //         : "Curriculum created successfully"
  //     );

  //     setShowForm(false);
  //     setEditModuleId(null);
  //     handleGetCurriculum();

  //     setFormData({
  //       course_id: "",
  //       title: "",
  //       description: "",
  //       order_index: 0,
  //       is_active: true,
  //     });
  //   } catch (error) {
  //     toast.error("Operation failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // /* ================= DELETE ================= */
  // const handleDelete = async (courseId: number, moduleId: number) => {
  //   if (!window.confirm("Are you sure you want to delete this module?"))
  //     return;

  //   try {
  //     const res = await fetch(
  //       `${BASE_API}/courses/${courseId}/curriculum/${moduleId}`,
  //       {
  //         method: "DELETE",
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (!res.ok) throw new Error("Delete failed");

  //     toast.success("Curriculum deleted successfully");
  //     handleGetCurriculum();
  //   } catch (error) {
  //     toast.error("Failed to delete curriculum");
  //   }
  // };

//     /* ================= GET PROGRESS ================= */
// const handleGetProgress = async () => {
//   if (!selectedProgressCourseId || !selectedStudentId) {
//     toast.error("Select course and student");
//     return;
//   }

//   try {
//     setLoading(true);

//     const res = await fetch(
//       `${BASE_API}/courses/trainer/students/${selectedStudentId}/courses/${selectedProgressCourseId}/progress`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!res.ok) {
//       throw new Error("Failed to fetch progress");
//     }

//     const data = await res.json();

//     setProgressData(data);
//     toast.success("Progress fetched successfully");

//   } catch (error) {
//     toast.error("Failed to fetch progress");
//     setProgressData(null);
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Curriculum Management</h1>

      // <Button onClick={() => setShowForm(!showForm)}>
      //   {showForm ? "Close Form" : "Add Curriculum"}
      // </Button>

     

      // {/* ================= FORM ================= */}
      

      // {showForm && (
      //   <Card>
      //     <CardHeader>
      //       <CardTitle>
      //         {editModuleId ? "Update Curriculum" : "Add Curriculum"}
      //       </CardTitle>
      //     </CardHeader>
      //     <CardContent>
      //       <form onSubmit={handleSubmit} className="space-y-4">
      //         <div>
      //           <Label>Select Course</Label>
      //           <select
      //             name="course_id"
      //             className="w-full border p-2 rounded"
      //             value={formData.course_id}
      //             onChange={handleChange}
      //             required
      //           >
      //             <option value="">-- Select Course --</option>
      //             {courses.map((course) => (
      //               <option key={course.id} value={course.id}>
      //                 {course.title}
      //               </option>
      //             ))}
      //           </select>
      //         </div>

      //         <Input
      //           name="title"
      //           placeholder="Title"
      //           value={formData.title}
      //           onChange={handleChange}
      //           required
      //         />

      //         <Textarea
      //           name="description"
      //           placeholder="Description"
      //           value={formData.description}
      //           onChange={handleChange}
      //         />

      //         <Input
      //           type="number"
      //           name="order_index"
      //           placeholder="Order Index"
      //           value={formData.order_index}
      //           onChange={handleChange}
      //         />

      //         <select
      //           name="is_active"
      //           className="w-full border p-2 rounded"
      //           value={formData.is_active.toString()}
      //           onChange={handleChange}
      //         >
      //           <option value="true">true</option>
      //           <option value="false">false</option>
      //         </select>

      //         <Button type="submit" className="w-full">
      //           {editModuleId ? "Update Curriculum" : "Create Curriculum"}
      //         </Button>
      //       </form>
      //     </CardContent>
      //   </Card>
      // )}

      // {/* ================= TABLE ================= */}
      // <Card>
      //   <CardHeader>
      //     <CardTitle>Curriculum List</CardTitle>
      //   </CardHeader>
      //   <CardContent>
      //     {curriculumList.length === 0 ? (
      //       <p className="text-center py-4">No data loaded</p>
      //     ) : (
      //       <table className="w-full border text-sm">
      //         <thead>
      //           <tr className="bg-gray-100 text-center">
      //             <th className="p-2">ID</th>
      //             <th className="p-2">Course ID</th>
      //             <th className="p-2">Title</th>
      //             <th className="p-2">Description</th>
      //             <th className="p-2">Order</th>
      //             <th className="p-2">Active</th>
      //             <th className="p-2">Actions</th>
      //           </tr>
      //         </thead>
      //         <tbody>
      //           {curriculumList.map((item) => (
      //             <tr key={item.id} className="text-center border-b">
      //               <td className="p-2">{item.id}</td>
      //               <td className="p-2">{item.course_id}</td>
      //               <td className="p-2">{item.title}</td>
      //               <td className="p-2">{item.description}</td>
      //               <td className="p-2">{item.order_index}</td>
      //               <td className="p-2">
      //                 {item.is_active ? "true" : "false"}
      //               </td>
      //               <td className="p-2 space-x-2">
      //                 <Button
      //                   size="sm"
      //                   onClick={() => {
      //                     setFormData({
      //                       course_id: item.course_id,
      //                       title: item.title,
      //                       description: item.description,
      //                       order_index: item.order_index,
      //                       is_active: item.is_active,
      //                     });
      //                     setEditModuleId(item.id);
      //                     setShowForm(true);
      //                   }}
      //                 >
      //                   Edit
      //                 </Button>

      //                 <Button
      //                   size="sm"
      //                   variant="destructive"
      //                   onClick={() =>
      //                     handleDelete(item.course_id, item.id)
      //                   }
      //                 >
      //                   Delete
      //                 </Button>
      //               </td>
      //             </tr>
      //           ))}
      //         </tbody>
      //       </table>
      //     )}
      //   </CardContent>
      // </Card>

//          {/* GET CURRICULUM */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Get Curriculum</CardTitle>
//         </CardHeader>
//         <CardContent className="flex gap-4">
//           <select
//             className="border p-2 rounded"
//             value={selectedCourseId}
//             onChange={(e) => setSelectedCourseId(e.target.value)}
//           >
//             <option value="">Select Course</option>
//             {courses.map((c) => (
//               <option key={c.id} value={c.id}>{c.title}</option>
//             ))}
//           </select>

//           <Button onClick={handleGetCurriculum}>
//             Fetch Curriculum
//           </Button>
//         </CardContent>
//       </Card>

//       {/* TABLE */}
      
//        {/* GET PROGRESS */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Get Progress</CardTitle>
//         </CardHeader>
//         <CardContent className="flex gap-4">
//           <select
//             className="border p-2 rounded"
//             value={selectedProgressCourseId}
//             onChange={(e) =>
//               setSelectedProgressCourseId(e.target.value)
//             }
//           >
//             <option value="">Select Course</option>
//             {courses.map((c) => (
//               <option key={c.id} value={c.id}>{c.title}</option>
//             ))}
//           </select>

//           <select
//             className="border p-2 rounded"
//             value={selectedStudentId}
//             onChange={(e) => setSelectedStudentId(e.target.value)}
//           >
//             <option value="">Select Student</option>
//             {students.map((s) => (
//               <option key={s.id} value={s.id}>{s.name}</option>
//             ))}
//           </select>

//           <Button onClick={handleGetProgress}>
//             Get Progress
//           </Button>
//         </CardContent>
// {progressData && (
//   <CardContent className="space-y-4 mt-4">

//     <div className="bg-gray-100 p-4 rounded-lg space-y-2">
//       <p><strong>Student ID:</strong> {progressData.student_id}</p>
//       <p><strong>Course ID:</strong> {progressData.course_id}</p>
//       <p>
//         <strong>Completion Ratio:</strong>{" "}
//         {(progressData.completion_ratio * 100).toFixed(2)}%
//       </p>
//       <p>
//         <strong>Completed Modules:</strong>{" "}
//         {progressData.completed_modules} / {progressData.total_modules}
//       </p>
//     </div>

//     {/* Progress Bar */}
//     <div className="w-full bg-gray-200 rounded-full h-4">
//       <div
//         className="bg-green-500 h-4 rounded-full"
//         style={{
//           width: `${progressData.completion_ratio * 100}%`,
//         }}
//       />
//     </div>

//     {/* Modules List */}
//     <div>
//       <h3 className="font-semibold mb-2">Modules Status</h3>
//       <table className="w-full border text-sm">
//         <thead>
//           <tr className="bg-gray-100 text-center">
//             <th className="border p-2">Module ID</th>
//             <th className="border p-2">Status</th>
//             <th className="border p-2">Completed At</th>
//           </tr>
//         </thead>
//         <tbody>
//           {progressData.modules?.map((module: any) => (
//             <tr key={module.module_id} className="text-center border-b">
//               <td className="border p-2">{module.module_id}</td>
//               <td className="border p-2">
//                 {module.status === "completed" ? (
//                   <span className="text-green-600 font-semibold">
//                     Completed
//                   </span>
//                 ) : (
//                   <span className="text-red-500">
//                     {module.status}
//                   </span>
//                 )}
//               </td>
//               <td className="border p-2">
//                 {module.completed_at
//                   ? new Date(module.completed_at).toLocaleString()
//                   : "—"}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>

//   </CardContent>
// )}
//       </Card>
//     </div>
//   );
// };

// export default Curriculum;


import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const COURSE_API = "http://192.168.0.122:10000/trainer/courses";
const STUDENT_API = "http://192.168.0.122:10000/trainer/my-students";
const BASE_API = "http://192.168.0.122:10000";

const Curriculum = () => {
  const token = localStorage.getItem("access_token");

  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [curriculumList, setCurriculumList] = useState<any[]>([]);
  const [editModuleId, setEditModuleId] = useState<number | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedProgressCourseId, setSelectedProgressCourseId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    order_index: 0,
    is_active: true,
  });


 


 /* ================= FETCH COURSES ================= */
  const fetchCourses = async () => {
    try {
      const res = await fetch(COURSE_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Courses fetch failed");

      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      toast.error("Failed to fetch courses");
    }
  };

  /* ================= FETCH STUDENTS ================= */
  const fetchStudents = async () => {
    try {
      const res = await fetch(STUDENT_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Students fetch failed");

      const data = await res.json();
      setStudents(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      toast.error("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchStudents(); // 👈 Added this
  }, []);

  /* ================= GET CURRICULUM ================= */
  const handleGetCurriculum = async () => {
    if (!selectedCourseId) {
      toast.error("Please select course");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_API}/courses/trainer/${selectedCourseId}/curriculum`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch curriculum");

      const data = await res.json();
      setCurriculumList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch curriculum");
      setCurriculumList([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "order_index"
          ? Number(value)
          : name === "is_active"
          ? value === "true"
          : value,
    }));
  };

  /* ================= CREATE OR UPDATE ================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.course_id) {
      toast.error("Please select course");
      return;
    }

    try {
      setLoading(true);

      const url = editModuleId
        ? `${BASE_API}/courses/${formData.course_id}/curriculum/${editModuleId}`
        : `${BASE_API}/courses/${formData.course_id}/curriculum`;

      const method = editModuleId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          order_index: formData.order_index,
          is_active: formData.is_active,
        }),
      });

      if (!res.ok) throw new Error("Failed to save curriculum");

      toast.success(
        editModuleId
          ? "Curriculum updated successfully"
          : "Curriculum created successfully"
      );

      setShowForm(false);
      setEditModuleId(null);
      handleGetCurriculum();

      setFormData({
        course_id: "",
        title: "",
        description: "",
        order_index: 0,
        is_active: true,
      });
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (courseId: number, moduleId: number) => {
    if (!window.confirm("Are you sure you want to delete this module?"))
      return;

    try {
      const res = await fetch(
        `${BASE_API}/courses/${courseId}/curriculum/${moduleId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Curriculum deleted successfully");
      handleGetCurriculum();
    } catch (error) {
      toast.error("Failed to delete curriculum");
    }
  };

  /* ================= GET PROGRESS ================= */
  const handleGetProgress = async () => {
    if (!selectedProgressCourseId || !selectedStudentId) {
      toast.error("Select course and student");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_API}/courses/trainer/students/${selectedStudentId}/courses/${selectedProgressCourseId}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch progress");

      const data = await res.json();
      setProgressData(data);
      toast.success("Progress fetched successfully");
    } catch (error) {
      toast.error("Failed to fetch progress");
      setProgressData(null);
    } finally {
      setLoading(false);
    }
  };
  /* ================= UPDATE MODULE STATUS ================= */
const handleUpdateModuleStatus = async (
  studentId: number,
  courseId: number,
  moduleId: number,
  statusValue: string
) => {
  try {
    const res = await fetch(
      `${BASE_API}/courses/students/${studentId}/courses/${courseId}/modules/${moduleId}/status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          course_id: courseId,
          module_id: moduleId,
          status_value: statusValue,
        }),
      }
    );

    if (!res.ok) throw new Error("Status update failed");

    toast.success("Module status updated successfully");

    // Refresh progress after update
    handleGetProgress();
  } catch (error) {
    toast.error("Failed to update module status");
  }
};


  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Curriculum Management</h1>
 <Button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Close Form" : "Add Curriculum"}
      </Button>

     

      {/* ================= FORM ================= */}
      

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editModuleId ? "Update Curriculum" : "Add Curriculum"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Select Course</Label>
                <select
                  name="course_id"
                  className="w-full border p-2 rounded"
                  value={formData.course_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <Textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
              />

              <Input
                type="number"
                name="order_index"
                placeholder="Order Index"
                value={formData.order_index}
                onChange={handleChange}
              />

              <select
                name="is_active"
                className="w-full border p-2 rounded"
                value={formData.is_active.toString()}
                onChange={handleChange}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>

              <Button type="submit" className="w-full">
                {editModuleId ? "Update Curriculum" : "Create Curriculum"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ================= TABLE ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Curriculum List</CardTitle>
        </CardHeader>
        <CardContent>
          {curriculumList.length === 0 ? (
            <p className="text-center py-4">No data loaded</p>
          ) : (
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="p-2">ID</th>
                  <th className="p-2">Course ID</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Order</th>
                  <th className="p-2">Active</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {curriculumList.map((item) => (
                  <tr key={item.id} className="text-center border-b">
                    <td className="p-2">{item.id}</td>
                    <td className="p-2">{item.course_id}</td>
                    <td className="p-2">{item.title}</td>
                    <td className="p-2">{item.description}</td>
                    <td className="p-2">{item.order_index}</td>
                    <td className="p-2">
                      {item.is_active ? "true" : "false"}
                    </td>
                    <td className="p-2 space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setFormData({
                            course_id: item.course_id,
                            title: item.title,
                            description: item.description,
                            order_index: item.order_index,
                            is_active: item.is_active,
                          });
                          setEditModuleId(item.id);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleDelete(item.course_id, item.id)
                        }
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* GET CURRICULUM */}
      <Card>
        <CardHeader>
          <CardTitle>Get Curriculum</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <select
            className="border p-2 rounded"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <Button onClick={handleGetCurriculum}>
            Fetch Curriculum
          </Button>
        </CardContent>
      </Card>

     
      {/* GET PROGRESS */}
      <Card>
        <CardHeader>
          <CardTitle>Get Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <select
            className="border p-2 rounded"
            value={selectedProgressCourseId}
            onChange={(e) =>
              setSelectedProgressCourseId(e.target.value)
            }
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

        {/* ✅ STUDENT DROPDOWN ADDED */}
          <select
            className="border p-2 rounded"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} (ID: {student.id})
              </option>
            ))}
          </select>

          <Button onClick={handleGetProgress}>
            Get Progress
          </Button>
        </CardContent>
{progressData && (
  <CardContent className="space-y-4 mt-4">

    <div className="bg-gray-100 p-4 rounded-lg space-y-2">
      <p><strong>Student ID:</strong> {progressData.student_id}</p>
      <p><strong>Course ID:</strong> {progressData.course_id}</p>
      <p>
        <strong>Completion Ratio:</strong>{" "}
        {(progressData.completion_ratio * 100).toFixed(2)}%
      </p>
      <p>
        <strong>Completed Modules:</strong>{" "}
        {progressData.completed_modules} / {progressData.total_modules}
      </p>
    </div>

    {/* Progress Bar */}
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-green-500 h-4 rounded-full"
        style={{
          width: `${progressData.completion_ratio * 100}%`,
        }}
      />
    </div>

    {/* Modules List */}
    <div>
      <h3 className="font-semibold mb-2">Modules Status</h3>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border p-2">Module ID</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Completed At</th>
          </tr>
        </thead>
        <tbody>
          {progressData.modules?.map((module: any) => (
            <tr key={module.module_id} className="text-center border-b">
              <td className="border p-2">{module.module_id}</td>
             <td className="border p-2">
  <select
    className="border p-1 rounded"
    value={module.status}
    onChange={(e) =>
      handleUpdateModuleStatus(
        progressData.student_id,
        progressData.course_id,
        module.module_id,
        e.target.value
      )
    }
  >
    <option value="not_started">Not Started</option>
    <option value="in_progress">In Progress</option>
    <option value="completed">Completed</option>
  </select>
</td>
              <td className="border p-2">
                {module.completed_at
                  ? new Date(module.completed_at).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </CardContent>
)}
      </Card>

    </div>
  );
};

export default Curriculum;