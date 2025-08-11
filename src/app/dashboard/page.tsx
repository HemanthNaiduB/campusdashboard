'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Student, StudentFilters, ViewMode } from '@/types/student';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import StudentFiltersComponent from '@/components/StudentFilters';
import StudentGrid from '@/components/StudentGrid';
import StudentTable from '@/components/StudentTable';

import ExportButton from '@/components/ExportButton';
import StudentPageClient from '@/app/student/[id]/StudentPageClient';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import { 
  ViewColumnsIcon, 
  Squares2X2Icon,
  UsersIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalStudent, setModalStudent] = useState<Student | null>(null);

  const defaultFilters: StudentFilters = {
    search: '',
    colleges: [],
    branch: '',
    selection_status: 'all',
    min_cgpa: null,
    min_github_score: null,
    min_hackerearth_score: null,
    skills: [],
    interview_round: 'all',
    interview_result: 'all',
    min_interview_score: null,
  };
  const [filters, setFilters] = useState<StudentFilters>(() => {
    if (typeof window === 'undefined') return defaultFilters;
    try {
      const raw = localStorage.getItem('dashboardFilters');
      return raw ? { ...defaultFilters, ...JSON.parse(raw) } as StudentFilters : defaultFilters;
    } catch {
      return defaultFilters;
    }
  });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Open full-screen modal instead of routing
  const handleStudentClick = (student: Student) => {
    sessionStorage.setItem('currentStudent', JSON.stringify(student));
    sessionStorage.setItem('dashboardFilters', JSON.stringify(filters));
    sessionStorage.setItem('dashboardScrollPosition', window.scrollY.toString());
    setModalStudent(student);
  };

  const closeStudentModal = () => {
    sessionStorage.removeItem('currentStudent');
    setModalStudent(null);
  };

  const refreshStudents = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'students'));
      const data: Student[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() } as Student));
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };

  // Persist filters to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('dashboardFilters', JSON.stringify(filters));
    } catch {}
  }, [filters]);

  // Fetch students from Firestore
  useEffect(() => {
    // First try without ordering to see if basic fetch works
    const q = collection(db, 'students');
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const studentsData: Student[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Student data:', data); // Debug log
        studentsData.push({ id: doc.id, ...data } as Student);
      });
      console.log('Total students fetched:', studentsData.length); // Debug log
      setStudents(studentsData);
      setLoading(false);
    }, (error) => {
      console.error('Detailed error fetching students:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      toast.error(`Failed to fetch students: ${error.message}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...students];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(student => 
        (student.name && student.name.toLowerCase().includes(searchTerm)) ||
        (student.email && student.email.toLowerCase().includes(searchTerm))
      );
    }

    // College filter
    if (filters.colleges && filters.colleges.length > 0) {
      const allow = new Set(filters.colleges);
      filtered = filtered.filter(student => student.college_name && allow.has(student.college_name));
    }

    // Branch filter
    if (filters.branch) {
      filtered = filtered.filter(student => student.branch && student.branch === filters.branch);
    }

    // Selection status filter
    if (filters.selection_status !== 'all') {
      filtered = filtered.filter(student => (student.selection_status || 'pending') === filters.selection_status);
    }

    // CGPA filter
    if (filters.min_cgpa !== null) {
      filtered = filtered.filter(student => (student.cgpa || 0) >= filters.min_cgpa!);
    }

    // GitHub score filter
    if (filters.min_github_score !== null) {
      filtered = filtered.filter(student => {
        const githubScore = student.github_score || student.github_overall_score || 0;
        return githubScore >= filters.min_github_score!;
      });
    }

    // HackerEarth score filter
    if (filters.min_hackerearth_score !== null) {
      filtered = filtered.filter(student => student.hackerearth_score >= filters.min_hackerearth_score!);
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(student => 
        student.skills && Array.isArray(student.skills) && filters.skills.some(skill => 
          student.skills.some(studentSkill => 
            studentSkill && typeof studentSkill === 'string' && 
            studentSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Interview round filter
    if (filters.interview_round !== 'all') {
      filtered = filtered.filter(student => 
        (student.interview_rounds || []).some(round => 
          round.round.toLowerCase() === filters.interview_round.toLowerCase()
        )
      );
    }

    // Interview result filter
    if (filters.interview_result !== 'all') {
      filtered = filtered.filter(student => 
        (student.interview_rounds || []).some(round => 
          round.result === filters.interview_result
        )
      );
    }

    // Min interview score filter
    if (filters.min_interview_score !== null) {
      filtered = filtered.filter(student => 
        (student.interview_rounds || []).some(round => 
          round.score >= filters.min_interview_score!
        )
      );
    }

    setFilteredStudents(filtered);
  }, [students, filters]);

  const stats = {
    total: students.length,
    filtered: filteredStudents.length,
    selected: filteredStudents.filter(s => (s.selection_status || 'pending') === 'selected').length,
    pending: filteredStudents.filter(s => (s.selection_status || 'pending') === 'pending').length,
    rejected: filteredStudents.filter(s => (s.selection_status || 'pending') === 'rejected').length,
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <UsersIcon className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Students</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <FunnelIcon className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Filtered</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{stats.filtered}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-blue-100 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${stats.total > 0 ? (stats.filtered / stats.total) * 100 : 0}%` }} 
                      />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {stats.total > 0 ? Math.round((stats.filtered / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FunnelIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Selected</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{stats.selected}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-green-100 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${stats.filtered > 0 ? (stats.selected / stats.filtered) * 100 : 0}%` }} 
                      />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {stats.filtered > 0 ? Math.round((stats.selected / stats.filtered) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <ClockIcon className="h-4 w-4 text-yellow-500" />
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pending</p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-yellow-100 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${stats.filtered > 0 ? (stats.pending / stats.filtered) * 100 : 0}%` }} 
                      />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {stats.filtered > 0 ? Math.round((stats.pending / stats.filtered) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Rejected</p>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-red-100 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${stats.filtered > 0 ? (stats.rejected / stats.filtered) * 100 : 0}%` }} 
                      />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {stats.filtered > 0 ? Math.round((stats.rejected / stats.filtered) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <XCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <StudentFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            students={students}
          />

          {/* Analytics Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl group"
            >
              <ChartBarIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
              {showAnalytics ? 
                <EyeSlashIcon className="h-4 w-4" /> : 
                <EyeIcon className="h-4 w-4" />
              }
            </button>
            
            {showAnalytics && (
              <div className="mt-6 animate-in slide-in-from-top duration-300">
                <AnalyticsCharts students={students} filteredStudents={filteredStudents} />
              </div>
            )}
          </div>

          {/* View Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-gray-600 hidden sm:block">View Mode:</span>
              <div className="glass rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm flex items-center ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm flex items-center ${
                    viewMode === 'table' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ViewColumnsIcon className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-3">
              <button
                onClick={refreshStudents}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                title="Refresh students"
              >
                Refresh
              </button>
              <ExportButton students={filteredStudents} />
            </div>
          </div>

          {/* Student List */}
          {viewMode === 'grid' ? (
            <StudentGrid 
              students={filteredStudents} 
              onStudentClick={handleStudentClick}
            />
          ) : (
            <StudentTable 
              students={filteredStudents} 
              onStudentClick={handleStudentClick}
            />
          )}


        </div>
        {modalStudent && (
          <div className="fixed inset-0 z-[60] bg-white overflow-auto">
            <StudentPageClient initialStudent={modalStudent} onClose={closeStudentModal} />
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}