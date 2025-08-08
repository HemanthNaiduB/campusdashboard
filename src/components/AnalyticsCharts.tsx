'use client';

import { useMemo } from 'react';
import { Student } from '@/types/student';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline';

interface AnalyticsChartsProps {
  students: Student[];
  filteredStudents: Student[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsCharts({ students, filteredStudents }: AnalyticsChartsProps) {
  const collegeDistribution = useMemo(() => {
    const distribution = students.reduce((acc, student) => {
      const college = student.college_name || 'Unknown';
      acc[college] = (acc[college] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution)
      .map(([college, count]) => ({ college, count, percentage: (count / students.length) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 colleges
  }, [students]);

  const branchDistribution = useMemo(() => {
    const distribution = filteredStudents.reduce((acc, student) => {
      const branch = student.branch || 'Unknown';
      acc[branch] = (acc[branch] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution)
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 branches
  }, [filteredStudents]);

  const statusDistribution = useMemo(() => {
    const distribution = filteredStudents.reduce((acc, student) => {
      const status = student.selection_status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { status: 'Selected', count: distribution.selected || 0, color: '#10b981' },
      { status: 'Pending', count: distribution.pending || 0, color: '#f59e0b' },
      { status: 'Rejected', count: distribution.rejected || 0, color: '#ef4444' }
    ];
  }, [filteredStudents]);

  const scoreDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ];

    return ranges.map(({ range, min, max }) => {
      const githubCount = filteredStudents.filter(s => {
        const score = s.github_score || s.github_overall_score || 0;
        return score >= min && score <= max;
      }).length;

      const hackerEarthCount = filteredStudents.filter(s => {
        const score = s.hackerearth_score || 0;
        return score >= min && score <= max;
      }).length;

      return {
        range,
        GitHub: githubCount,
        HackerEarth: hackerEarthCount
      };
    });
  }, [filteredStudents]);

  const avgScoresByCollege = useMemo(() => {
    const collegeScores = students.reduce((acc, student) => {
      const college = student.college_name || 'Unknown';
      if (!acc[college]) {
        acc[college] = { 
          githubScores: [], 
          hackerEarthScores: [], 
          cgpaScores: [] 
        };
      }
      
      if (student.github_score || student.github_overall_score) {
        acc[college].githubScores.push(student.github_score || student.github_overall_score || 0);
      }
      if (student.hackerearth_score) {
        acc[college].hackerEarthScores.push(student.hackerearth_score);
      }
      if (student.cgpa) {
        acc[college].cgpaScores.push(student.cgpa);
      }
      
      return acc;
    }, {} as Record<string, { githubScores: number[], hackerEarthScores: number[], cgpaScores: number[] }>);

    return Object.entries(collegeScores)
      .map(([college, scores]) => ({
        college: college.length > 15 ? college.substring(0, 15) + '...' : college,
        avgGitHub: scores.githubScores.length > 0 ? 
          Math.round(scores.githubScores.reduce((a, b) => a + b, 0) / scores.githubScores.length) : 0,
        avgHackerEarth: scores.hackerEarthScores.length > 0 ? 
          Math.round(scores.hackerEarthScores.reduce((a, b) => a + b, 0) / scores.hackerEarthScores.length) : 0,
        avgCGPA: scores.cgpaScores.length > 0 ? 
          Number((scores.cgpaScores.reduce((a, b) => a + b, 0) / scores.cgpaScores.length).toFixed(2)) : 0
      }))
      .filter(item => item.avgGitHub > 0 || item.avgHackerEarth > 0)
      .sort((a, b) => (b.avgGitHub + b.avgHackerEarth) - (a.avgGitHub + a.avgHackerEarth))
      .slice(0, 6); // Top 6 colleges by performance
  }, [students]);

  if (students.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">Analytics will appear once student data is loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        </div>
        <div className="text-sm text-gray-500">
          Based on {filteredStudents.length} filtered students
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* College Distribution */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AcademicCapIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Students by College</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collegeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="college" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: string | number) => [value, 'Students']}
                labelFormatter={(label) => `College: ${label}`}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Selection Status Pie Chart */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartPieIcon className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Selection Status Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count, percent }) => {
                  const pct = typeof percent === 'number' ? percent : 0;
                  return `${status}: ${count} (${(pct * 100).toFixed(0)}%)`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Score Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="GitHub" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="HackerEarth" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Scores by College */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Average Scores by College</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={avgScoresByCollege}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="college" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="avgGitHub" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="Avg GitHub Score"
              />
              <Area 
                type="monotone" 
                dataKey="avgHackerEarth" 
                stackId="1" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="Avg HackerEarth Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branch Distribution (if space allows) */}
      {branchDistribution.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Students by Branch (Filtered Results)</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={branchDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="branch" width={100} />
              <Tooltip formatter={(value: string | number) => [value, 'Students']} />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}