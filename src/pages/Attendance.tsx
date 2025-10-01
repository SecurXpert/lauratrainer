import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mockAttendance, mockStudentAttendance } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { Search } from 'lucide-react';

const Attendance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudentAttendance[0] | null>(null);

  const filteredStudents = mockStudentAttendance.filter(student => 
    student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const dailyData = mockAttendance.daily.map((value, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    attendance: value
  }));

  const monthlyData = mockAttendance.monthly.map((value, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
    attendance: value
  }));

  const studentDailyData = selectedStudent ? selectedStudent.classAttendance.daily.map((value, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    classAttendance: value,
    mcqPractice: selectedStudent.mcqPractice.daily[index],
    codingPractice: selectedStudent.codingPractice.daily[index]
  })) : [];

  const studentMonthlyData = selectedStudent ? selectedStudent.classAttendance.monthly.map((value, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
    classAttendance: value,
    mockInterviews: selectedStudent.mockInterviews.monthly[index],
    exams: selectedStudent.exams.monthly[index]
  })) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance Analytics</h1>

      {/* Student Search Section */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Individual Student Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {filteredStudents.map(student => (
                <button
                  key={student.studentId}
                  onClick={() => {
                    setSelectedStudent(student);
                    setSearchQuery('');
                  }}
                  className="p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{student.studentName}</div>
                  <div className="text-sm text-muted-foreground">{student.studentId}</div>
                </button>
              ))}
            </div>
          )}

          {selectedStudent && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div>
                <div className="font-medium">{selectedStudent.studentName}</div>
                <div className="text-sm text-muted-foreground">{selectedStudent.studentId}</div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-sm text-primary hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Student Analytics */}
      {selectedStudent && (
        <>
          <h2 className="text-2xl font-bold">Analytics for {selectedStudent.studentName}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Daily Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentDailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="classAttendance" fill="hsl(var(--primary))" name="Class" />
                    <Bar dataKey="mcqPractice" fill="hsl(var(--success))" name="MCQ" />
                    <Bar dataKey="codingPractice" fill="hsl(var(--accent-foreground))" name="Coding" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="classAttendance" fill="hsl(var(--primary))" name="Class" />
                    <Bar dataKey="mockInterviews" fill="hsl(var(--secondary))" name="Interviews" />
                    <Bar dataKey="exams" fill="hsl(var(--success))" name="Exams" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Overall Analytics */}
      <h2 className="text-2xl font-bold">{selectedStudent ? 'Overall Class Analytics' : 'Overall Analytics'}</h2>

      {/* Daily Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Daily Class Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Practice Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>MCQ Practice Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="hsl(var(--success))" name="MCQ Practice" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Coding Practice Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="hsl(var(--accent-foreground))" name="Coding Practice" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Mock Test & Exam Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Mock Interview Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="hsl(var(--primary))" name="Interview Attendance" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Examination Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="hsl(var(--secondary))" name="Exam Attendance" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
