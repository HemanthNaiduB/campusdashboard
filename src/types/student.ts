export interface InterviewRound {
  round: string; // L1, L2, L3, etc.
  score: number;
  reviewer?: string;
  result: 'pass' | 'fail' | 'pending';
  notes?: string;
  date?: string;
}

export interface Student {
  id: string;
  student_id?: number;
  name: string;
  email: string;
  phone: string;
  college_name: string;
  branch: string | null;
  selection_status: 'selected' | 'rejected' | 'pending' | null;
  cgpa: number | null;
  github_score: number;
  github_overall_score?: number;
  hackerearth_score: number;
  skills: string[];
  resume_url: string;
  github_url: string;
  code_quality_score: number;
  followers: number;
  public_repos: number;
  commit_frequency: number | string;
  created_at?: string;
  updated_at?: string;
  // Interview rounds
  interview_rounds?: InterviewRound[];
  // Additional fields from your data structure
  basic_info?: string;
  github_context?: string;
  executive_summary?: string;
  notable_projects?: string;
}

export interface StudentFilters {
  search: string;
  colleges: string[];
  branch: string;
  selection_status: 'all' | 'selected' | 'rejected' | 'pending';
  min_cgpa: number | null;
  min_github_score: number | null;
  min_hackerearth_score: number | null;
  skills: string[];
  interview_round: string; // L1, L2, L3, etc. or 'all'
  interview_result: 'all' | 'pass' | 'fail' | 'pending';
  min_interview_score: number | null;
}

export type ViewMode = 'grid' | 'table';