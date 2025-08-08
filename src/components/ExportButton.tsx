'use client';

import { useState } from 'react';
import { Student } from '@/types/student';
import { 
  ArrowDownTrayIcon, 
  DocumentTextIcon,
  TableCellsIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import * as Papa from 'papaparse';
import toast from 'react-hot-toast';

interface ExportButtonProps {
  students: Student[];
}

export default function ExportButton({ students }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    if (students.length === 0) {
      toast.error('No students to export');
      return;
    }

    setIsExporting(true);
    setShowDropdown(false);

    try {
      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      if (format === 'csv') {
        // Prepare data for CSV export
        const csvData = students.map(student => ({
          Name: student.name,
          Email: student.email,
          Phone: student.phone,
          College: student.college_name,
          Branch: student.branch || 'N/A',
          CGPA: student.cgpa || 'N/A',
          'GitHub Score': student.github_score || student.github_overall_score || 0,
          'HackerEarth Score': student.hackerearth_score || 0,
          'Selection Status': student.selection_status || 'pending',
          'Code Quality Score': student.code_quality_score || 0,
          'GitHub Followers': student.followers || 0,
          'Public Repos': student.public_repos || 0,
          'Commit Frequency': student.commit_frequency || 'N/A',
          Skills: student.skills?.join('; ') || 'N/A',
          'Resume URL': student.resume_url || '',
          'GitHub URL': student.github_url || '',
          'Interview Rounds': (student.interview_rounds || []).map(r => `${r.round}: ${r.score} (${r.result})`).join('; ') || 'N/A',
        }));

        fileContent = Papa.unparse(csvData);
        fileName = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
      } else {
        // JSON export
        fileContent = JSON.stringify(students, null, 2);
        fileName = `students_export_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json;charset=utf-8;';
      }
      
      // Create and download file
      const blob = new Blob([fileContent], { type: mimeType });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${students.length} students as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Main Export Button */}
        <button
          onClick={() => handleExport('csv')}
          disabled={isExporting || students.length === 0}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              <span>Export CSV</span>
              <span className="ml-2 px-2 py-1 bg-emerald-600 rounded-full text-xs font-medium">
                {students.length}
              </span>
            </>
          )}
        </button>

        {/* Dropdown Toggle */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isExporting || students.length === 0}
          className="inline-flex items-center px-3 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-smooth"
          >
            <DocumentTextIcon className="h-4 w-4 text-emerald-600" />
            <span>Export as CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-smooth"
          >
            <TableCellsIcon className="h-4 w-4 text-blue-600" />
            <span>Export as JSON</span>
          </button>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}