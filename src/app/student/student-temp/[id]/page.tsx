'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Student, InterviewRound } from '@/types/student';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useStudentUpdate } from '@/hooks/useStudentUpdate';
import { 
  XMarkIcon, ArrowLeftIcon, PlusIcon, TrashIcon, UserIcon, ChartBarIcon, 
  BriefcaseIcon, Cog6ToothIcon, PhoneIcon, EnvelopeIcon, MapPinIcon,
  AcademicCapIcon, StarIcon, ClockIcon, CalendarIcon, DocumentTextIcon,
  PresentationChartLineIcon, TrophyIcon, CodeBracketIcon, BuildingOfficeIcon,
  ClipboardDocumentListIcon, ChatBubbleLeftRightIcon, UserGroupIcon,
  CheckCircleIcon, XCircleIcon, FireIcon, LightBulbIcon, CpuChipIcon, 
  PuzzlePieceIcon, HeartIcon, BeakerIcon, ChatBubbleOvalLeftEllipsisIcon, 
  MegaphoneIcon, PencilIcon
} from '@heroicons/react/24/outline';



interface EnhancedInterviewRound extends InterviewRound {
  type?: string;
  subType?: string;
  detailedScoring?: {
    technicalCompetency: number;
    communicationSkills: number;
    problemSolving: number;
    culturalFit: number;
  };
  interviewer?: string;
  duration?: number;
}

export default function StudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingHackerEarth, setEditingHackerEarth] = useState(false);
  const [hackerEarthScore, setHackerEarthScore] = useState(0);
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>([]);
  const [newRound, setNewRound] = useState<InterviewRound>({
    round: '',
    score: 0,
    result: 'pending',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [showAddRound, setShowAddRound] = useState(false);
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [selectedRoundName, setSelectedRoundName] = useState<string>('');
  
  // Enhanced Interview State
  const [selectedRoundType, setSelectedRoundType] = useState<string>('technical');
  const [selectedSubType, setSelectedSubType] = useState<string>('');
  const [detailedScoring, setDetailedScoring] = useState({
    technicalCompetency: 0,
    communicationSkills: 0,
    problemSolving: 0,
    culturalFit: 0
  });
  const [interviewComments, setInterviewComments] = useState('');
  const [showRoundDetails, setShowRoundDetails] = useState<number | null>(null);
  
  const { updateHackerEarthScore, updateInterviewRounds, updateSelectionStatus } = useStudentUpdate();

  // Available interview round options
  const interviewRoundOptions = [
    'Group Discussion',
    'L1',
    'L2', 
    'Final'
  ];

  // Load student data (from sessionStorage first, then Firebase)
  useEffect(() => {
    const loadStudent = async () => {
      if (!studentId) return;
      
      try {
        // First try to get data from sessionStorage (instant)
        const cachedStudent = sessionStorage.getItem('currentStudent');
        if (cachedStudent) {
          const studentData = JSON.parse(cachedStudent) as Student;
          if (studentData.id === studentId) {
            setStudent(studentData);
            setHackerEarthScore(studentData.hackerearth_score || 0);
            setInterviewRounds(studentData.interview_rounds || []);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to Firebase if no cached data
        const studentRef = doc(db, 'students', studentId);
        const studentSnap = await getDoc(studentRef);
        
        if (studentSnap.exists()) {
          const studentData = { id: studentSnap.id, ...studentSnap.data() } as Student;
          setStudent(studentData);
          setHackerEarthScore(studentData.hackerearth_score || 0);
          setInterviewRounds(studentData.interview_rounds || []);
        } else {
          // Student not found, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error loading student:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
    
    // Cleanup only current student data when component unmounts
    return () => {
      sessionStorage.removeItem('currentStudent');
    };
  }, [studentId, router]);

  // Memoized calculations for better performance
  const studentInitials = useMemo(() => {
    if (!student) return '';
    return student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, [student?.name]);

  const interviewStats = useMemo(() => ({
    total: interviewRounds.length,
    passed: interviewRounds.filter(r => r.result === 'pass').length,
    failed: interviewRounds.filter(r => r.result === 'fail').length,
    pending: interviewRounds.filter(r => r.result === 'pending').length
  }), [interviewRounds]);

  // Round Types & Templates (memoized for performance)
  const roundTypes = useMemo(() => ({
    technical: {
      name: 'Technical Round',
      icon: CpuChipIcon,
      color: 'blue',
      subTypes: [
        { id: 'coding-live', name: 'Coding Assessment (Live)', icon: CodeBracketIcon },
        { id: 'coding-takehome', name: 'Coding Assessment (Take-home)', icon: DocumentTextIcon },
        { id: 'system-design', name: 'System Design Discussion', icon: PuzzlePieceIcon },
        { id: 'technical-qa', name: 'Technical Knowledge Q&A', icon: LightBulbIcon },
        { id: 'code-review', name: 'Code Review Session', icon: BeakerIcon },
        { id: 'architecture', name: 'Architecture Discussion', icon: BuildingOfficeIcon }
      ]
    },
    hr: {
      name: 'HR Round',
      icon: HeartIcon,
      color: 'pink',
      subTypes: [
        { id: 'behavioral', name: 'Behavioral Questions', icon: ChatBubbleLeftRightIcon },
        { id: 'cultural-fit', name: 'Cultural Fit Assessment', icon: HeartIcon },
        { id: 'salary-benefits', name: 'Salary & Benefits Discussion', icon: TrophyIcon },
        { id: 'background', name: 'Background Verification', icon: CheckCircleIcon },
        { id: 'references', name: 'Reference Checks', icon: UserIcon }
      ]
    },
    groupDiscussion: {
      name: 'Group Discussion',
      icon: UserGroupIcon,
      color: 'green',
      subTypes: [
        { id: 'topic-assignment', name: 'Topic Assignment', icon: MegaphoneIcon },
        { id: 'participation', name: 'Participation Tracking', icon: ChatBubbleOvalLeftEllipsisIcon },
        { id: 'leadership', name: 'Leadership Assessment', icon: StarIcon },
        { id: 'communication', name: 'Communication Evaluation', icon: ChatBubbleLeftRightIcon },
        { id: 'team-dynamics', name: 'Team Dynamics Analysis', icon: UserGroupIcon }
      ]
    },
    managerial: {
      name: 'Managerial Round',
      icon: TrophyIcon,
      color: 'purple',
      subTypes: [
        { id: 'leadership-scenarios', name: 'Leadership Scenarios', icon: StarIcon },
        { id: 'decision-making', name: 'Decision-making Cases', icon: LightBulbIcon },
        { id: 'strategic-thinking', name: 'Strategic Thinking', icon: PresentationChartLineIcon },
        { id: 'team-management', name: 'Team Management', icon: UserGroupIcon },
        { id: 'vision-alignment', name: 'Vision Alignment', icon: FireIcon }
      ]
    }
  }), []);

  const handleSaveHackerEarth = useCallback(async () => {
    if (!student) return;
    try {
      await updateHackerEarthScore(student.id, hackerEarthScore);
      setEditingHackerEarth(false);
      setStudent(prev => prev ? { ...prev, hackerearth_score: hackerEarthScore } : null);
    } catch {
      // Error handled in hook
    }
  }, [student, hackerEarthScore, updateHackerEarthScore]);

  const handleAddInterviewRound = useCallback(async () => {
    if (!student || !selectedRoundName.trim()) return;
    
    const enhancedRound = {
      ...newRound,
      round: selectedRoundName,
    };
    
    const updatedRounds = [...interviewRounds, enhancedRound];
    try {
      await updateInterviewRounds(student.id, updatedRounds);
      setInterviewRounds(updatedRounds);
      setStudent(prev => prev ? { ...prev, interview_rounds: updatedRounds } : null);
      
      // Reset form
      setNewRound({
        round: '',
        score: 0,
        result: 'pending',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
      setSelectedRoundName('');
      setShowAddRound(false);
    } catch {
      // Error handled in hook
    }
  }, [student, interviewRounds, newRound, selectedRoundName, updateInterviewRounds]);

  const handleEditRound = useCallback(async (index: number, updatedRound: InterviewRound) => {
    if (!student) return;
    const updatedRounds = [...interviewRounds];
    updatedRounds[index] = updatedRound;
    try {
      await updateInterviewRounds(student.id, updatedRounds);
      setInterviewRounds(updatedRounds);
      setStudent(prev => prev ? { ...prev, interview_rounds: updatedRounds } : null);
      setEditingRound(null);
    } catch {
      // Error handled in hook
    }
  }, [student, interviewRounds, updateInterviewRounds]);

  const handleDeleteRound = useCallback(async (index: number) => {
    if (!student) return;
    const updatedRounds = interviewRounds.filter((_, i) => i !== index);
    try {
      await updateInterviewRounds(student.id, updatedRounds);
      setInterviewRounds(updatedRounds);
      setStudent(prev => prev ? { ...prev, interview_rounds: updatedRounds } : null);
    } catch {
      // Error handled in hook
    }
  }, [student, interviewRounds, updateInterviewRounds]);

  const handleStatusChange = useCallback(async (newStatus: 'selected' | 'rejected' | 'pending') => {
    if (!student) return;
    try {
      await updateSelectionStatus(student.id, newStatus);
      setStudent(prev => prev ? { ...prev, selection_status: newStatus } : null);
    } catch {
      // Error handled in hook
    }
  }, [student, updateSelectionStatus]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon },
    { id: 'interviews', name: 'Interviews', icon: BriefcaseIcon },
    { id: 'actions', name: 'Actions', icon: Cog6ToothIcon },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading student details...</p>
              <p className="text-gray-400 text-sm mt-2">Fetching data from database</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!student) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h1>
              <p className="text-gray-600 mb-4">The student you&apos;re looking for doesn&apos;t exist.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Rest of the component with the same content structure as StudentModal
  // but as a full page instead of modal
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 border-b border-gray-200 px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {/* Back Button */}
                <button
                  onClick={() => {
                    // Clean up only the current student data when going back
                    // Keep filter state and scroll position for restoration
                    sessionStorage.removeItem('currentStudent');
                    router.push('/dashboard');
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200"
                  title="Back to Dashboard"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                
                {/* Compact Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {studentInitials}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                    (student.selection_status || 'pending') === 'selected' ? 'bg-green-500' :
                    (student.selection_status || 'pending') === 'rejected' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                </div>
                
                {/* Student Info */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mt-1">
                    <span>{student.email}</span>
                    <span>{student.college_name}</span>
                    <span>CGPA: {student.cgpa || 'N/A'}</span>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  (student.selection_status || 'pending') === 'selected' 
                    ? 'bg-green-100 text-green-800' :
                  (student.selection_status || 'pending') === 'rejected' 
                    ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                  {(student.selection_status || 'pending').toUpperCase()}
                </div>
                
                {/* Quick Metrics */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {student.github_score || student.github_overall_score || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrophyIcon className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {student.hackerearth_score || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClipboardDocumentListIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {interviewStats.total} rounds
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <a
                  href={student.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200"
                  title="Resume"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                </a>
                <a
                  href={student.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200"
                  title="GitHub"
                >
                  <CodeBracketIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-200 px-6">
            <nav className="flex space-x-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-3 py-4 px-4 font-semibold text-sm transition-all duration-300 rounded-t-xl ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-lg transform -translate-y-1'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{tab.name}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-t-full" />
                    )}
                    
                    {/* Badge for interview count */}
                    {tab.id === 'interviews' && interviewStats.total > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                        {interviewStats.total}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-8 min-h-screen">
            {activeTab === 'interviews' && (
              <div className="space-y-8">
                {/* Interview Progress Pipeline */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-indigo-100 rounded-xl">
                        <BriefcaseIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Interview Pipeline</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-600">Success Rate:</div>
                      <div className="text-lg font-bold text-green-600">
                        {interviewStats.total > 0 ? Math.round((interviewStats.passed / interviewStats.total) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Pipeline Stepper - Simplified version from the modal */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-white rounded-xl shadow-lg border-l-4 border-indigo-500">
                      <div className="text-3xl font-bold text-indigo-600 mb-2">{interviewStats.total}</div>
                      <div className="text-sm font-medium text-gray-600">Total Rounds</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl shadow-lg border-l-4 border-green-500">
                      <div className="text-3xl font-bold text-green-600 mb-2">{interviewStats.passed}</div>
                      <div className="text-sm font-medium text-gray-600">Passed</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl shadow-lg border-l-4 border-red-500">
                      <div className="text-3xl font-bold text-red-600 mb-2">{interviewStats.failed}</div>
                      <div className="text-sm font-medium text-gray-600">Failed</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl shadow-lg border-l-4 border-yellow-500">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">{interviewStats.pending}</div>
                      <div className="text-sm font-medium text-gray-600">Pending</div>
                    </div>
                  </div>
                </div>

                {/* Add Round Button */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Interview Rounds Management</h3>
                      <p className="text-sm text-gray-500 mt-1">Comprehensive interview tracking with detailed assessments</p>
                    </div>
                    <button
                      onClick={() => setShowAddRound(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl group"
                    >
                      <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Schedule New Round
                    </button>
                  </div>

                  {/* Rounds List - Simplified from modal */}
                  {interviewRounds.length > 0 ? (
                    <div className="space-y-4">
                      {interviewRounds.map((round, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          {editingRound === index ? (
                            // Edit mode
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Round Name</label>
                                  <select
                                    value={round.round}
                                    onChange={(e) => setInterviewRounds(prev => 
                                      prev.map((r, i) => i === index ? { ...r, round: e.target.value } : r)
                                    )}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Select Round</option>
                                    {interviewRoundOptions.map((option) => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={round.score}
                                    onChange={(e) => setInterviewRounds(prev => 
                                      prev.map((r, i) => i === index ? { ...r, score: parseInt(e.target.value) || 0 } : r)
                                    )}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
                                  <select
                                    value={round.result}
                                    onChange={(e) => setInterviewRounds(prev => 
                                      prev.map((r, i) => i === index ? { ...r, result: e.target.value as 'pass' | 'fail' | 'pending' } : r)
                                    )}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="pass">Pass</option>
                                    <option value="fail">Fail</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                  <input
                                    type="date"
                                    value={round.date || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setInterviewRounds(prev => 
                                      prev.map((r, i) => i === index ? { ...r, date: e.target.value } : r)
                                    )}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <textarea
                                  value={round.notes || ''}
                                  onChange={(e) => setInterviewRounds(prev => 
                                    prev.map((r, i) => i === index ? { ...r, notes: e.target.value } : r)
                                  )}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditRound(index, round)}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                  Save Changes
                                </button>
                                <button
                                  onClick={() => setEditingRound(null)}
                                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                                    round.result === 'pass' ? 'bg-green-500' :
                                    round.result === 'fail' ? 'bg-red-500' :
                                    'bg-yellow-500'
                                  }`}>
                                    {round.result === 'pass' ? <CheckCircleIcon className="h-5 w-5" /> :
                                     round.result === 'fail' ? <XCircleIcon className="h-5 w-5" /> :
                                     <ClockIcon className="h-5 w-5" />}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{round.round}</h4>
                                    <div className="text-sm text-gray-600">
                                      Score: {round.score}/100 • {new Date(round.date || new Date()).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    round.result === 'pass' ? 'bg-green-100 text-green-800' :
                                    round.result === 'fail' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {round.result.toUpperCase()}
                                  </span>
                                  <button
                                    onClick={() => setEditingRound(index)}
                                    className="p-1 text-blue-500 hover:text-blue-700"
                                    title="Edit Round"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRound(index)}
                                    className="p-1 text-red-500 hover:text-red-700"
                                    title="Delete Round"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              {round.notes && (
                                <div className="mt-3 p-3 bg-white rounded-lg border-l-4 border-blue-400">
                                  <p className="text-sm text-gray-600">{round.notes}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interview Rounds Yet</h3>
                      <p className="text-gray-500 mb-4">Start the interview process by scheduling the first round</p>
                      <button
                        onClick={() => setShowAddRound(true)}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-colors"
                      >
                        Schedule First Round
                      </button>
                    </div>
                  )}

                  {/* Simplified Add Round Form */}
                  {showAddRound && (
                    <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Interview Round</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Round Name</label>
                          <select
                            value={selectedRoundName}
                            onChange={(e) => setSelectedRoundName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Round Type</option>
                            {interviewRoundOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Score (0-100)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Score"
                            value={newRound.score}
                            onChange={(e) => setNewRound({ ...newRound, score: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
                          <select
                            value={newRound.result}
                            onChange={(e) => setNewRound({ ...newRound, result: e.target.value as 'pass' | 'fail' | 'pending' })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="pass">Pass</option>
                            <option value="fail">Fail</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                          <input
                            type="date"
                            value={newRound.date}
                            onChange={(e) => setNewRound({ ...newRound, date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                          placeholder="Interview notes and feedback..."
                          value={newRound.notes}
                          onChange={(e) => setNewRound({ ...newRound, notes: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddInterviewRound}
                          disabled={!selectedRoundName.trim()}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          Save Round
                        </button>
                        <button
                          onClick={() => {
                            setShowAddRound(false);
                            setSelectedRoundName('');
                            setNewRound({
                              round: '',
                              score: 0,
                              result: 'pending',
                              notes: '',
                              date: new Date().toISOString().split('T')[0],
                            });
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Overview Tab - Full Featured */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Academic Information Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Academic Information</h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-700">CGPA</h4>
                        <div className="text-2xl font-bold text-blue-600">{student.cgpa || 'N/A'}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((parseFloat(String(student.cgpa || '0')) / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">College</h4>
                      <p className="text-gray-900 font-medium">{student.college_name}</p>
                      <p className="text-gray-600 text-sm mt-1">Branch: {student.branch}</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Branch</h4>
                      <p className="text-gray-900 font-medium">{student.branch || 'Not specified'}</p>
                      <p className="text-gray-600 text-sm mt-1">Academic Branch</p>
                    </div>
                  </div>
                </div>

                {/* Technical Skills Section */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <CodeBracketIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Technical Skills</h3>
                    </div>
                  </div>
                  
                  {student.skills && student.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {student.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No skills listed</p>
                  )}
                </div>

                {/* Performance Scores Section */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <ChartBarIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Performance Scores</h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* GitHub Score */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-700">GitHub Score</h4>
                        <div className="text-xl font-bold text-gray-800">
                          {student.github_score || student.github_overall_score || 0}/100
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gray-600 h-3 rounded-full" 
                          style={{ width: `${student.github_score || student.github_overall_score || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* HackerEarth Score - Editable */}
                    <div className="bg-orange-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-700">HackerEarth Score</h4>
                        <div className="flex items-center space-x-2">
                          {editingHackerEarth ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={hackerEarthScore}
                                onChange={(e) => setHackerEarthScore(parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              <button
                                onClick={handleSaveHackerEarth}
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingHackerEarth(false);
                                  setHackerEarthScore(student.hackerearth_score || 0);
                                }}
                                className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="text-xl font-bold text-orange-600">{hackerEarthScore}/100</div>
                              <button
                                onClick={() => setEditingHackerEarth(true)}
                                className="p-1 text-orange-600 hover:text-orange-800"
                                title="Edit Score"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-3">
                        <div 
                          className="bg-orange-500 h-3 rounded-full" 
                          style={{ width: `${hackerEarthScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                      <PhoneIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{student.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{student.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab - Enhanced */}
            {activeTab === 'performance' && (
              <div className="space-y-8">
                {/* Overall Performance Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <PresentationChartLineIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Performance Dashboard</h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {Math.round(((student.github_score || student.github_overall_score || 0) + (student.hackerearth_score || 0)) / 2)}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Overall Score</div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {student.github_score || student.github_overall_score || 0}
                      </div>
                      <div className="text-sm font-medium text-gray-600">GitHub Score</div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {student.hackerearth_score || 0}
                      </div>
                      <div className="text-sm font-medium text-gray-600">HackerEarth</div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {((parseFloat(String(student.cgpa || '0')) / 10) * 100).toFixed(0)}
                      </div>
                      <div className="text-sm font-medium text-gray-600">Academic %</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Performance Metrics */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Performance Analysis</h3>
                  
                  <div className="space-y-6">
                    {/* GitHub Performance */}
                    <div className="border-l-4 border-gray-500 pl-6">
                      <h4 className="font-semibold text-gray-800 mb-2">GitHub Performance</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Repository Quality</span>
                            <span>{student.github_score || student.github_overall_score || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gray-600 h-2 rounded-full" 
                              style={{ width: `${student.github_score || student.github_overall_score || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* HackerEarth Performance */}
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h4 className="font-semibold text-gray-800 mb-2">HackerEarth Performance</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Problem Solving</span>
                            <span>{student.hackerearth_score || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${student.hackerearth_score || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Academic Performance */}
                    <div className="border-l-4 border-blue-500 pl-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Academic Performance</h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>CGPA ({student.cgpa || 'N/A'})</span>
                            <span>{((parseFloat(String(student.cgpa || '0')) / 10) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((parseFloat(String(student.cgpa || '0')) / 10) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Recommendations */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Insights</h3>
                  
                  <div className="space-y-4">
                    {(student.github_score || student.github_overall_score || 0) < 50 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">
                          <strong>Recommendation:</strong> GitHub score could be improved. Consider contributing to more projects and improving code quality.
                        </p>
                      </div>
                    )}
                    
                    {(student.hackerearth_score || 0) < 50 && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-orange-800">
                          <strong>Recommendation:</strong> HackerEarth score needs attention. Focus on algorithm practice and problem-solving skills.
                        </p>
                      </div>
                    )}
                    
                    {(parseFloat(String(student.cgpa || '0'))) < 7.0 && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800">
                          <strong>Academic Note:</strong> Consider academic improvement opportunities to strengthen overall profile.
                        </p>
                      </div>
                    )}
                    
                    {(student.github_score || student.github_overall_score || 0) >= 80 && (student.hackerearth_score || 0) >= 80 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">
                          <strong>Excellent Performance!</strong> Strong technical skills across multiple platforms. Great candidate for technical roles.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions Tab - Enhanced */}
            {activeTab === 'actions' && (
              <div className="space-y-8">
                {/* Status Management */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Cog6ToothIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Selection Status Management</h3>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h4 className="font-semibold text-gray-700 mb-4">Current Status</h4>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {['pending', 'selected', 'rejected'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status as 'selected' | 'rejected' | 'pending')}
                          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            (student.selection_status || 'pending') === status
                              ? status === 'selected' ? 'bg-green-500 text-white shadow-lg scale-105' :
                                status === 'rejected' ? 'bg-red-500 text-white shadow-lg scale-105' :
                                'bg-yellow-500 text-white shadow-lg scale-105'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {status === 'selected' && <CheckCircleIcon className="h-4 w-4 inline mr-2" />}
                          {status === 'rejected' && <XCircleIcon className="h-4 w-4 inline mr-2" />}
                          {status === 'pending' && <ClockIcon className="h-4 w-4 inline mr-2" />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {(student.selection_status || 'pending') === 'pending' ? '✓' : '—'}
                        </div>
                        <div className="text-sm text-gray-600">Under Review</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {(student.selection_status || 'pending') === 'selected' ? '✓' : '—'}
                        </div>
                        <div className="text-sm text-gray-600">Selected</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {(student.selection_status || 'pending') === 'rejected' ? '✓' : '—'}
                        </div>
                        <div className="text-sm text-gray-600">Not Selected</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <a
                      href={student.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                      <span className="font-medium text-blue-800">View Resume</span>
                    </a>
                    
                    <a
                      href={student.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <CodeBracketIcon className="h-6 w-6 text-gray-600" />
                      <span className="font-medium text-gray-800">View GitHub</span>
                    </a>
                    
                    <button
                      onClick={() => navigator.clipboard.writeText(student.email)}
                      className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <EnvelopeIcon className="h-6 w-6 text-indigo-600" />
                      <span className="font-medium text-indigo-800">Copy Email</span>
                    </button>
                  </div>
                </div>

                {/* Student Summary for Actions */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Student Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Overall Performance Score</span>
                      <span className="text-lg font-bold text-blue-600">
                        {Math.round(((student.github_score || student.github_overall_score || 0) + (student.hackerearth_score || 0)) / 2)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Interview Rounds Completed</span>
                      <span className="text-lg font-bold text-green-600">{interviewStats.total}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Success Rate</span>
                      <span className="text-lg font-bold text-purple-600">
                        {interviewStats.total > 0 ? Math.round((interviewStats.passed / interviewStats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}