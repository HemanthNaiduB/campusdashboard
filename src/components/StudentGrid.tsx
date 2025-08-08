'use client';

import { memo } from 'react';
import { Student } from '@/types/student';
import { 
  UserCircleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  StarIcon,
  ChartBarIcon,
  CodeBracketIcon,
  EyeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface StudentGridProps {
  students: Student[];
  onStudentClick: (student: Student) => void;
}

function StudentGrid({ students, onStudentClick }: StudentGridProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'selected': 
        return { 
          bg: 'bg-green-50', 
          text: 'text-green-700', 
          border: 'border-green-200',
          icon: CheckCircleIcon,
          badge: 'bg-green-100 text-green-800'
        };
      case 'rejected': 
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-700', 
          border: 'border-red-200',
          icon: XCircleIcon,
          badge: 'bg-red-100 text-red-800'
        };
      case 'pending': 
        return { 
          bg: 'bg-yellow-50', 
          text: 'text-yellow-700', 
          border: 'border-yellow-200',
          icon: ClockIcon,
          badge: 'bg-yellow-100 text-yellow-800'
        };
      default: 
        return { 
          bg: 'bg-gray-50', 
          text: 'text-gray-700', 
          border: 'border-gray-200',
          icon: ClockIcon,
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getScoreColor = (score: number, maxScore: number = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number, maxScore: number = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const generateInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (students.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCircleIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
        <p className="text-gray-500">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {students.map((student) => {
        const status = student.selection_status || 'pending';
        const statusConfig = getStatusConfig(status);
        const StatusIcon = statusConfig.icon;
        const githubScore = student.github_score || student.github_overall_score || 0;
        const hackerEarthScore = student.hackerearth_score || 0;

        return (
          <div
            key={student.id}
            className={`glass hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 rounded-2xl overflow-hidden group hover:scale-[1.02] ${statusConfig.border} select-none`}
            onClick={() => onStudentClick(student)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onStudentClick(student);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${student.name}`}
          >
            {/* Header with Avatar and Status */}
            <div className="relative p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {generateInitials(student.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{student.email}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.badge}`}>
                  <StatusIcon className="h-3 w-3" />
                  <span className="capitalize">{status}</span>
                </div>
              </div>

              {/* College and Branch */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <AcademicCapIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{student.college_name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpenIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{student.branch || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* CGPA Section */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">CGPA</span>
                <span className="text-lg font-bold text-gray-900">{student.cgpa || 'N/A'}</span>
              </div>
              {student.cgpa && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(student.cgpa, 10)}`}
                    style={{ width: `${(student.cgpa / 10) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Scores Section */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <CodeBracketIcon className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-xs font-medium text-blue-600">GitHub</span>
                  </div>
                  <p className={`text-lg font-bold ${getScoreColor(githubScore)}`}>
                    {githubScore}
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full ${getProgressColor(githubScore)}`}
                      style={{ width: `${githubScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <ChartBarIcon className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs font-medium text-green-600">HackerEarth</span>
                  </div>
                  <p className={`text-lg font-bold ${getScoreColor(hackerEarthScore)}`}>
                    {hackerEarthScore}
                  </p>
                  <div className="w-full bg-green-200 rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full ${getProgressColor(hackerEarthScore)}`}
                      style={{ width: `${hackerEarthScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Top Skills</span>
                <span className="text-xs text-gray-500">{(student.skills || []).length} total</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(student.skills || []).slice(0, 3).map((skill, index) => (
                  skill && (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  )
                ))}
                {(student.skills || []).length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    +{(student.skills || []).length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Footer with Additional Info */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <span>Quality: {student.code_quality_score}</span>
                  <span>Repos: {student.public_repos}</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EyeIcon className="h-3 w-3" />
                  <span className="font-medium">View</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(StudentGrid);