import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from "./services/api/api";
import { QuestionBankItem, Exam } from '../components/ExamManagement/ExamManagementTypes';
import ExamManagementHeader from '../components/ExamManagement/ExamManagementHeader';
import ExamManagementTabs from '../components/ExamManagement/ExamManagementTabs';
import ExamManagementQuestionsList from '../components/ExamManagement/ExamManagementQuestionsList';
import ExamManagementQuestionDetails from '../components/ExamManagement/ExamManagementQuestionDetails';
import ExamManagementExamsList from '../components/ExamManagement/ExamManagementExamsList';
import ExamManagementExamDetails from '../components/ExamManagement/ExamManagementExamDetails';

export default function ExamManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabFromSearch = searchParams.get('tab') as 'questions' | 'exams' | null;
  const initialTab = location.state?.activeTab || tabFromSearch || 'questions';
  const [activeTab, setActiveTab] = useState<'questions' | 'exams'>(initialTab);
  const [questionView, setQuestionView] = useState<'list' | 'details'>('list');
  const [selectedBankQuestion, setSelectedBankQuestion] = useState<QuestionBankItem | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  // Question state
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [questionBank.length]);

  // Exam state
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const token = localStorage.getItem('access_token');

  /* ================= FETCH QUESTION BANK ================= */
  const fetchQuestionBank = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/compiler-questions/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch question bank');
      const data = await res.json();
      setQuestionBank(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load question bank');
    }
  };

  /* ================= FETCH EXAMS ================= */
  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/exam/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch exams');
      const data = await res.json();
      setExams(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load exams');
    }
  };

  const handleDeleteExam = async (id: number) => {
    const previousExams = [...exams];
    setExams(exams.filter((e) => e.id !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/exam/delete?exam_id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to delete exam');

      toast.success('Exam deleted successfully');
      fetchExams();
    } catch (err: any) {
      setExams(previousExams);
      toast.error(err.message || 'Failed to delete exam');
    }
  };

  /* ================= FETCH EXAM DETAILS ================= */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchExamDetails = async (examId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/exam/get/details?exam_id=${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch exam details');
      const data = await res.json();
      setSelectedExam(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load exam details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionBank();
    fetchExams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteQuestion = async (id: number) => {
    const previousBank = [...questionBank];
    setQuestionBank(questionBank.filter((q) => (q.question_id || q.id) !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/compiler-questions/delete?question_id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to delete question');

      toast.success('Question deleted successfully', { duration: 3000 });
      fetchQuestionBank();
    } catch (err: any) {
      setQuestionBank(previousBank);
      toast.error(err.message || 'Failed to delete question', { duration: 3000 });
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 sm:p-8 bg-[#f8fafc] min-h-screen font-sans">
      <ExamManagementHeader />

      <ExamManagementTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setQuestionView={setQuestionView} 
      />

      {activeTab === 'questions' && (
        <div className="space-y-8">
          {questionView === 'list' && (
            <ExamManagementQuestionsList 
              questionBank={questionBank}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              handleDeleteQuestion={handleDeleteQuestion}
            />
          )}

          {questionView === 'details' && selectedBankQuestion && (
            <ExamManagementQuestionDetails 
              selectedBankQuestion={selectedBankQuestion}
              setQuestionView={setQuestionView}
            />
          )}
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ExamManagementExamsList 
            exams={exams}
            handleDeleteExam={handleDeleteExam}
            setSelectedExam={setSelectedExam}
          />

          {selectedExam && (
            <ExamManagementExamDetails 
              selectedExam={selectedExam}
              setSelectedExam={setSelectedExam}
            />
          )}
        </div>
      )}
    </div>
  );
}
