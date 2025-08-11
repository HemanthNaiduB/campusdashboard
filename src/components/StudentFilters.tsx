'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Student, StudentFilters } from '@/types/student';
import { 
  MagnifyingGlassIcon,
  AcademicCapIcon,
  BookOpenIcon,
  StarIcon,
  ChartBarIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface StudentFiltersProps {
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  students: Student[];
}

export default function StudentFiltersComponent({ filters, onFiltersChange, students }: StudentFiltersProps) {
  // Local draft filters - only applied when "Apply Filters" is clicked
  const [draftFilters, setDraftFilters] = useState<StudentFilters>(filters);
  const [skillsInput, setSkillsInput] = useState(filters.skills.join(', '));
  const [isBasicFiltersOpen, setIsBasicFiltersOpen] = useState(true);
  const [isScoreFiltersOpen, setIsScoreFiltersOpen] = useState(false);
  const [isInterviewFiltersOpen, setIsInterviewFiltersOpen] = useState(false);
  const [showCollegesModal, setShowCollegesModal] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [tempColleges, setTempColleges] = useState<string[]>(filters.colleges || []);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => { setIsBrowser(true); }, []);

  // Get unique values for dropdowns
  const colleges = [...new Set(students.map(s => s.college_name))].filter(Boolean).sort();
  const branches = [...new Set(students.map(s => s.branch).filter(Boolean))].sort();

  const handleDraftFilterChange = (key: keyof StudentFilters, value: string | number | null | string[]) => {
    setDraftFilters({ ...draftFilters, [key]: value });
  };

  const handleSkillsChange = (value: string) => {
    setSkillsInput(value);
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleDraftFilterChange('skills', skillsArray);
  };

  const applyFilters = () => {
    onFiltersChange(draftFilters);
  };

  const clearFilters = () => {
    const clearedFilters: StudentFilters = {
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
    setDraftFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setSkillsInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = filters.skills.filter(skill => skill !== skillToRemove);
    const updatedFilters = { ...filters, skills: updatedSkills };
    onFiltersChange(updatedFilters);
    setDraftFilters(updatedFilters);
    setSkillsInput(updatedSkills.join(', '));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.colleges && filters.colleges.length > 0) count++;
    if (filters.branch) count++;
    if (filters.selection_status !== 'all') count++;
    if (filters.min_cgpa) count++;
    if (filters.min_github_score) count++;
    if (filters.min_hackerearth_score) count++;
    if (filters.skills.length > 0) count++;
    if (filters.interview_round !== 'all') count++;
    if (filters.interview_result !== 'all') count++;
    if (filters.min_interview_score) count++;
    return count;
  };

  const getDraftFiltersChanges = () => {
    return JSON.stringify(draftFilters) !== JSON.stringify(filters);
  };

  return (
    <div className="glass rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FunnelIcon className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {getActiveFiltersCount()} active
              </span>
            )}
            {getDraftFiltersChanges() && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                Changes pending
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={applyFilters}
              disabled={!getDraftFiltersChanges()}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span>Apply Filters</span>
            </button>
            <button
              onClick={clearFilters}
              disabled={getActiveFiltersCount() === 0}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircleIcon className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Active Filters Chips */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Active Filters:</h3>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  <MagnifyingGlassIcon className="h-3 w-3" />
                  <span>Search: &quot;{filters.search}&quot;</span>
                  <button onClick={() => {
                    const updatedFilters = { ...filters, search: '' };
                    onFiltersChange(updatedFilters);
                    setDraftFilters(updatedFilters);
                  }}>
                    <XMarkIcon className="h-3 w-3 hover:text-blue-600" />
                  </button>
                </div>
              )}
              {filters.colleges && filters.colleges.length > 0 && filters.colleges.map((c) => (
                <div key={c} className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  <AcademicCapIcon className="h-3 w-3" />
                  <span>College: {c}</span>
                  <button onClick={() => {
                    const next = filters.colleges.filter(x => x !== c);
                    const updatedFilters = { ...filters, colleges: next };
                    onFiltersChange(updatedFilters);
                    setDraftFilters(updatedFilters);
                  }}>
                    <XMarkIcon className="h-3 w-3 hover:text-green-600" />
                  </button>
                </div>
              ))}
              {filters.branch && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  <BookOpenIcon className="h-3 w-3" />
                  <span>Branch: {filters.branch}</span>
                  <button onClick={() => {
                    const updatedFilters = { ...filters, branch: '' };
                    onFiltersChange(updatedFilters);
                    setDraftFilters(updatedFilters);
                  }}>
                    <XMarkIcon className="h-3 w-3 hover:text-purple-600" />
                  </button>
                </div>
              )}
              {filters.selection_status !== 'all' && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  <StarIcon className="h-3 w-3" />
                  <span>Status: {filters.selection_status}</span>
                  <button onClick={() => {
                    const updatedFilters = { ...filters, selection_status: 'all' as const };
                    onFiltersChange(updatedFilters);
                    setDraftFilters(updatedFilters);
                  }}>
                    <XMarkIcon className="h-3 w-3 hover:text-yellow-600" />
                  </button>
                </div>
              )}
              {filters.skills.map((skill) => (
                <div key={skill} className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                  <WrenchScrewdriverIcon className="h-3 w-3" />
                  <span>{skill}</span>
                  <button onClick={() => removeSkill(skill)}>
                    <XMarkIcon className="h-3 w-3 hover:text-indigo-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Basic Filters Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsBasicFiltersOpen(!isBasicFiltersOpen)}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-smooth"
          >
            <div className="flex items-center space-x-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Basic Filters</span>
            </div>
            {isBasicFiltersOpen ? 
              <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : 
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            }
          </button>
          
          {isBasicFiltersOpen && (
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Students
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={draftFilters.search}
                      onChange={(e) => handleDraftFilterChange('search', e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Colleges (multi via modal) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colleges
                  </label>
                  <button
                    type="button"
                    onClick={() => { setTempColleges(draftFilters.colleges || []); setShowCollegesModal(true); }}
                    className="w-full inline-flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-gray-800 shadow-sm"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <AcademicCapIcon className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="truncate">
                        {draftFilters.colleges && draftFilters.colleges.length > 0
                          ? (() => {
                              const s = draftFilters.colleges;
                              return s.length <= 2 ? s.join(', ') : `${s[0]}, ${s[1]} +${s.length - 2}`;
                            })()
                          : 'All Colleges'}
                      </span>
                    </span>
                    <span className="text-sm text-blue-600">Select</span>
                  </button>
                  {showCollegesModal && isBrowser && createPortal((
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setShowCollegesModal(false)} />
                      <div className="relative z-[81] w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto my-8 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow">
                              <AcademicCapIcon className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Select Colleges</h3>
                          </div>
                          <button onClick={() => setShowCollegesModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>

                        {/* Search */}
                        <div className="px-6 py-4 border-b border-gray-200">
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              value={collegeSearch}
                              onChange={(e) => setCollegeSearch(e.target.value)}
                              placeholder="Search colleges..."
                              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* List */}
                        <div className="px-6 py-4 flex-1 overflow-auto">
                          {(() => {
                            const visible = colleges.filter(c => c.toLowerCase().includes(collegeSearch.toLowerCase()));
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {visible.map((college) => {
                                  const checked = tempColleges.includes(college);
                                  return (
                                    <button
                                      key={college}
                                      type="button"
                                      role="checkbox"
                                      aria-checked={checked}
                                      onClick={() => {
                                        setTempColleges((prev) =>
                                          prev.includes(college)
                                            ? prev.filter((x) => x !== college)
                                            : [...prev, college]
                                        );
                                      }}
                                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all select-none ${checked ? 'bg-green-50 border-green-300 ring-2 ring-green-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                    >
                                      <span className="text-sm text-gray-800 pr-3">{college}</span>
                                      <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full border ${checked ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                                        {checked && <CheckCircleIcon className="h-5 w-5 text-white" />}
                                      </span>
                                    </button>
                                  );
                                })}
                                {visible.length === 0 && (
                                  <div className="text-center text-gray-500 col-span-2 py-8 text-sm">No colleges match your search.</div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <button
                              onClick={() => setTempColleges([])}
                              className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                              Clear all
                            </button>
                            <button
                              onClick={() => {
                                const visible = colleges.filter(c => c.toLowerCase().includes(collegeSearch.toLowerCase()));
                                setTempColleges(visible);
                              }}
                              className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                              Select all visible
                            </button>
                            <button
                              onClick={() => {
                                const visible = colleges.filter(c => c.toLowerCase().includes(collegeSearch.toLowerCase()));
                                const setVisible = new Set(visible);
                                const toggledVisible = visible.filter(c => !tempColleges.includes(c));
                                const keptInvisible = tempColleges.filter(c => !setVisible.has(c));
                                setTempColleges([...keptInvisible, ...toggledVisible]);
                              }}
                              className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                              Invert visible
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setShowCollegesModal(false)} className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 border border-gray-200 text-sm">
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                handleDraftFilterChange('colleges', tempColleges);
                                onFiltersChange({ ...draftFilters, colleges: tempColleges });
                                setShowCollegesModal(false);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Apply ({tempColleges.length})
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ), document.body)}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch
                  </label>
                  <div className="relative">
                    <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={draftFilters.branch}
                      onChange={(e) => handleDraftFilterChange('branch', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                    >
                      <option value="">All Branches</option>
                      {branches.filter(branch => branch !== null).map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selection Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selection Status
                  </label>
                  <div className="relative">
                    <StarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={draftFilters.selection_status}
                      onChange={(e) => handleDraftFilterChange('selection_status', e.target.value as StudentFilters['selection_status'])}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Score Filters Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsScoreFiltersOpen(!isScoreFiltersOpen)}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-smooth"
          >
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Score Filters</span>
            </div>
            {isScoreFiltersOpen ? 
              <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : 
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            }
          </button>
          
          {isScoreFiltersOpen && (
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Min CGPA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={draftFilters.min_cgpa || ''}
                    onChange={(e) => handleDraftFilterChange('min_cgpa', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g., 7.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Min GitHub Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min GitHub Score
                  </label>
                  <div className="relative">
                    <CodeBracketIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                                          value={draftFilters.min_github_score || ''}
                    onChange={(e) => handleDraftFilterChange('min_github_score', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="e.g., 80"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Min HackerEarth Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min HackerEarth Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={draftFilters.min_hackerearth_score || ''}
                    onChange={(e) => handleDraftFilterChange('min_hackerearth_score', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g., 75"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Skills
                  </label>
                  <div className="relative">
                    <WrenchScrewdriverIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                      placeholder="React, Python, Java, etc."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interview Filters Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsInterviewFiltersOpen(!isInterviewFiltersOpen)}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-smooth"
          >
            <div className="flex items-center space-x-3">
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Interview Filters</span>
            </div>
            {isInterviewFiltersOpen ? 
              <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : 
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            }
          </button>
          
          {isInterviewFiltersOpen && (
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Round
                  </label>
                  <select
                    value={draftFilters.interview_round}
                    onChange={(e) => handleDraftFilterChange('interview_round', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                  >
                    <option value="all">All Rounds</option>
                    <option value="Group Discussion">Group Discussion</option>
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="Final">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Result
                  </label>
                  <div className="relative">
                    <CheckCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                                          value={draftFilters.interview_result}
                    onChange={(e) => handleDraftFilterChange('interview_result', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                    >
                      <option value="all">All Results</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Interview Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={draftFilters.min_interview_score || ''}
                    onChange={(e) => handleDraftFilterChange('min_interview_score', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g., 70"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}