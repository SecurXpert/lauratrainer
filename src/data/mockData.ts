export const mockStudents = [
  { id: 'S001', name: 'Alice Johnson', email: 'alice@example.com', performance: 85 },
  { id: 'S002', name: 'Bob Smith', email: 'bob@example.com', performance: 92 },
  { id: 'S003', name: 'Carol Williams', email: 'carol@example.com', performance: 78 },
  { id: 'S004', name: 'David Brown', email: 'david@example.com', performance: 88 },
  { id: 'S005', name: 'Emma Davis', email: 'emma@example.com', performance: 95 },
  { id: 'S006', name: 'Frank Miller', email: 'frank@example.com', performance: 82 },
  { id: 'S007', name: 'Grace Wilson', email: 'grace@example.com', performance: 90 },
  { id: 'S008', name: 'Henry Moore', email: 'henry@example.com', performance: 76 },
  { id: 'S009', name: 'Ivy Taylor', email: 'ivy@example.com', performance: 89 },
  { id: 'S010', name: 'Jack Anderson', email: 'jack@example.com', performance: 91 }
];

export const mockCourses = [
  { id: 'C001', name: 'Advanced JavaScript', materials: 24, students: 45 },
  { id: 'C002', name: 'React Fundamentals', materials: 18, students: 52 },
  { id: 'C003', name: 'Python for Data Science', materials: 32, students: 38 },
  { id: 'C004', name: 'Web Design Essentials', materials: 20, students: 41 },
  { id: 'C005', name: 'Database Management', materials: 28, students: 35 },
  { id: 'C006', name: 'Mobile App Development', materials: 26, students: 29 },
  { id: 'C007', name: 'Machine Learning Basics', materials: 30, students: 33 }
];

export const mockQuizzes = [
  { id: 'Q001', courseId: 'C001', courseName: 'Advanced JavaScript', type: 'MCQ', questions: 10 },
  { id: 'Q002', courseId: 'C001', courseName: 'Advanced JavaScript', type: 'Coding', questions: 5 },
  { id: 'Q003', courseId: 'C002', courseName: 'React Fundamentals', type: 'MCQ', questions: 12 },
  { id: 'Q004', courseId: 'C002', courseName: 'React Fundamentals', type: 'Coding', questions: 6 },
  { id: 'Q005', courseId: 'C003', courseName: 'Python for Data Science', type: 'MCQ', questions: 15 },
  { id: 'Q006', courseId: 'C003', courseName: 'Python for Data Science', type: 'Coding', questions: 8 }
];

export const mockClasses = [
  { id: 'CL001', courseId: 'C001', title: 'Introduction to ES6', date: '2025-01-15', hasRecording: true, hasMaterials: true },
  { id: 'CL002', courseId: 'C001', title: 'Async/Await Patterns', date: '2025-01-17', hasRecording: true, hasMaterials: true },
  { id: 'CL003', courseId: 'C002', title: 'React Hooks Deep Dive', date: '2025-01-16', hasRecording: true, hasMaterials: false },
  { id: 'CL004', courseId: 'C002', title: 'State Management', date: '2025-01-18', hasRecording: false, hasMaterials: true }
];

export const mockExams = [
  { id: 'E001', type: 'Weekly', courseId: 'C001', courseName: 'Advanced JavaScript', date: '2025-01-20', students: 45 },
  { id: 'E002', type: 'Monthly', courseId: 'C002', courseName: 'React Fundamentals', date: '2025-01-25', students: 52 },
  { id: 'E003', type: 'Mock', courseId: 'C003', courseName: 'Python for Data Science', date: '2025-01-22', students: 38 },
  { id: 'E004', type: 'Course Completion', courseId: 'C004', courseName: 'Web Design Essentials', date: '2025-01-30', students: 41 }
];

export const mockInterviews = [
  { id: 'I001', studentName: 'Alice Johnson', date: '2025-01-18', time: '10:00 AM', status: 'upcoming', type: 'technical' },
  { id: 'I002', studentName: 'Bob Smith', date: '2025-01-19', time: '2:00 PM', status: 'upcoming', type: 'behavioral' },
  { id: 'I003', studentName: 'Carol Williams', date: '2025-01-10', time: '11:00 AM', status: 'completed', result: 'Passed', type: 'technical' },
  { id: 'I004', studentName: 'David Brown', date: '2025-01-12', time: '3:00 PM', status: 'completed', result: 'Excellent', type: 'technical' },
  { id: 'I005', studentName: 'Emma Davis', date: '2025-01-08', time: '1:00 PM', status: 'rejected', reason: 'Time conflict', type: 'behavioral' }
];

export const mockAttendance = {
  daily: [85, 88, 92, 87, 90, 89, 91],
  monthly: [82, 85, 88, 90, 87, 91, 89, 92, 88, 90, 93, 91]
};

export const mockStudentAttendance = mockStudents.map(student => ({
  studentId: student.id,
  studentName: student.name,
  classAttendance: {
    daily: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 80),
    monthly: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 75)
  },
  mcqPractice: {
    daily: Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 70),
  },
  codingPractice: {
    daily: Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 65),
  },
  mockInterviews: {
    monthly: Array.from({ length: 12 }, () => Math.floor(Math.random() * 10) + 70)
  },
  exams: {
    monthly: Array.from({ length: 12 }, () => Math.floor(Math.random() * 15) + 75)
  }
}));

export const mockPerformance = {
  monthly: [78, 82, 85, 88, 86, 90, 87, 89, 91, 88, 92, 90],
  weekly: [85, 88, 90, 87, 92, 89, 91]
};

export const mockChats = [
  { id: 'CH001', studentId: 'S001', studentName: 'Alice Johnson', lastMessage: 'When is the next quiz?', timestamp: '2025-01-15 10:30 AM', unread: true },
  { id: 'CH002', studentId: 'S002', studentName: 'Bob Smith', lastMessage: 'Could you clarify the assignment?', timestamp: '2025-01-15 09:15 AM', unread: false },
  { id: 'CH003', studentId: 'S003', studentName: 'Carol Williams', lastMessage: 'Thank you for the feedback!', timestamp: '2025-01-14 4:20 PM', unread: false }
];

export const mockEvents = [
  { id: 'EV001', title: 'JavaScript Quiz', type: 'quiz', date: '2025-01-20', time: '10:00 AM', course: 'Advanced JavaScript' },
  { id: 'EV002', title: 'React Workshop', type: 'class', date: '2025-01-22', time: '2:00 PM', course: 'React Fundamentals' },
  { id: 'EV003', title: 'Python Exam', type: 'exam', date: '2025-01-25', time: '9:00 AM', course: 'Python for Data Science' },
  { id: 'EV004', title: 'Mock Interview', type: 'interview', date: '2025-01-18', time: '11:00 AM', course: 'General' },
  { id: 'EV005', title: 'Holiday - MLK Day', type: 'holiday', date: '2025-01-20', time: 'All Day', course: 'N/A' }
];
