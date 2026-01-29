import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCriteriaStats, getYearlyProgress, getDocumentStats, mockFaculty, mockDocuments } from '@/data/mockData';
import { useDocuments, useStats, useFacultyUsers } from '@/hooks/useApiData';
import { academicYears } from '@/data/criteriaData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

const COLORS = ['hsl(217, 71%, 25%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)'];

export default function Reports() {
  const [selectedYear, setSelectedYear] = useState('all');

  const { stats: realStats, isLoading: statsLoading } = useStats();
  const { documents: allDocuments, isLoading: docsLoading } = useDocuments();
  const { faculty, isLoading: facultyLoading } = useFacultyUsers();

  // Fallback to mock data if real data is not available
  const stats = realStats || getDocumentStats();

  // Normalize stats to handle both real and mock data
  const normalizedStats = {
    totalDocuments: realStats ? realStats.totalDocuments : (stats as any).total,
    approved: stats.approved,
    pending: stats.pending,
    rejected: stats.rejected,
  };

  // Generate criteria stats from real data
  const criteriaStats = allDocuments.length > 0
    ? Object.entries(allDocuments.reduce((acc, doc) => {
      if (!acc[doc.criteria]) {
        acc[doc.criteria] = { completed: 0, pending: 0 };
      }
      if (doc.iqacStatus === 'Approved') {
        acc[doc.criteria].completed++;
      } else {
        acc[doc.criteria].pending++;
      }
      return acc;
    }, {} as Record<string, { completed: number; pending: number }>))
      .map(([criteria, data]) => ({
        criteria,
        completed: data.completed,
        pending: data.pending
      }))
    : getCriteriaStats();

  // Generate yearly progress from real data
  const yearlyProgress = allDocuments.length > 0
    ? Object.entries(allDocuments.reduce((acc, doc) => {
      if (!acc[doc.academicYear]) {
        acc[doc.academicYear] = { completed: 0, pending: 0, rejected: 0 };
      }
      switch (doc.iqacStatus) {
        case 'Approved':
          acc[doc.academicYear].completed++;
          break;
        case 'Pending':
          acc[doc.academicYear].pending++;
          break;
        case 'Rejected':
          acc[doc.academicYear].rejected++;
          break;
      }
      return acc;
    }, {} as Record<string, { completed: number; pending: number; rejected: number }>))
      .map(([year, data]) => ({
        year,
        completed: data.completed,
        pending: data.pending,
        rejected: data.rejected
      }))
    : getYearlyProgress();

  // Generate faculty contribution from real data
  const facultyContribution = allDocuments.length > 0
    ? Array.from(
      allDocuments.reduce((map, doc) => {
        if (!map.has(doc.facultyName)) {
          map.set(doc.facultyName, {
            name: doc.facultyName.split(' ').pop() || doc.facultyName,
            fullName: doc.facultyName,
            uploads: 0,
            approved: 0,
            pending: 0,
            rejected: 0
          });
        }
        const faculty = map.get(doc.facultyName)!;
        faculty.uploads++;
        switch (doc.iqacStatus) {
          case 'Approved':
            faculty.approved++;
            break;
          case 'Pending':
            faculty.pending++;
            break;
          case 'Rejected':
            faculty.rejected++;
            break;
        }
        return map;
      }, new Map<string, { name: string; fullName: string; uploads: number; approved: number; pending: number; rejected: number }>())).map(([, data]) => data)
    : mockFaculty.map(f => ({
      name: f.name.split(' ').slice(-1)[0], // Last name only for chart
      fullName: f.name,
      uploads: mockDocuments.filter(d => d.facultyId === f.id).length,
      approved: mockDocuments.filter(d => d.facultyId === f.id && d.iqacStatus === 'approved').length,
      pending: mockDocuments.filter(d => d.facultyId === f.id && d.iqacStatus === 'pending').length,
    }));

  const pieData = [
    { name: 'Approved', value: normalizedStats.approved },
    { name: 'Pending', value: normalizedStats.pending },
    { name: 'Rejected', value: normalizedStats.rejected },
  ];



  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive AQAR progress reports and statistics</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Total Documents</p>
                  <p className="text-3xl font-bold">{normalizedStats.totalDocuments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Completion Rate</p>
                  <p className="text-3xl font-bold">{normalizedStats.totalDocuments ? Math.round((normalizedStats.approved / normalizedStats.totalDocuments) * 100) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <BarChart3 className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Pending Review</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Active Faculty</p>
                  <p className="text-3xl font-bold">
                    {facultyLoading ? '-' : faculty.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Criteria Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Criteria-wise Document Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={criteriaStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="criteria" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill="hsl(142, 71%, 45%)" name="Completed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" fill="hsl(38, 92%, 50%)" name="Pending" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index + 1]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index + 1] }} />
                    <span className="text-sm font-medium">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Year-wise Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Year-wise AQAR Progress Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={{ fill: 'hsl(142, 71%, 45%)', r: 6 }} name="Completed" />
                  <Line type="monotone" dataKey="pending" stroke="hsl(38, 92%, 50%)" strokeWidth={3} dot={{ fill: 'hsl(38, 92%, 50%)', r: 6 }} name="Pending" />
                  <Line type="monotone" dataKey="rejected" stroke="hsl(0, 84%, 60%)" strokeWidth={3} dot={{ fill: 'hsl(0, 84%, 60%)', r: 6 }} name="Rejected" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Faculty Contribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Faculty-wise Contribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facultyContribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => [value, name === 'approved' ? 'Approved' : name === 'pending' ? 'Pending' : 'Total Uploads']}
                  />
                  <Legend />
                  <Bar dataKey="approved" fill="hsl(142, 71%, 45%)" name="Approved" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="pending" fill="hsl(38, 92%, 50%)" name="Pending" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
