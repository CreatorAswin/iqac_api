import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDocuments, useUsers, useStats } from '@/hooks/useApiData';
import { naacCriteria } from '@/data/criteriaData';
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export function AdminDashboard() {
  const { documents, isLoading: docsLoading } = useDocuments();
  const { users, isLoading: usersLoading } = useUsers();
  const { stats, isLoading: statsLoading } = useStats();

  const isLoading = docsLoading || usersLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const approved = documents.filter(d => d.iqacStatus === 'Approved').length;
  const pending = documents.filter(d => d.iqacStatus === 'Pending').length;
  const rejected = documents.filter(d => d.iqacStatus === 'Rejected').length;
  const facultyCount = users.filter(u => u.role.toLowerCase() === 'faculty').length;

  const pieData = [
    { name: 'Approved', value: approved },
    { name: 'Pending', value: pending },
    { name: 'Rejected', value: rejected },
  ];

  const criteriaStats = naacCriteria.map(c => {
    const docs = documents.filter(d => d.criteria === String(c.number));
    return {
      criteria: `C${c.number}`,
      completed: docs.filter(d => d.iqacStatus === 'Approved').length,
      pending: docs.filter(d => d.iqacStatus === 'Pending').length,
    };
  });

  const recentDocuments = documents.slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Complete system overview and management</p>
      </div>

      <div className="mobile-stat-grid">
        <StatCard
          title="Total Documents"
          value={documents.length}
          subtitle="All uploads"
          icon={<FileText className="w-5 md:w-6 h-5 md:h-6" />}
          variant="primary"
        />
        <StatCard
          title="Approved"
          value={approved}
          subtitle={documents.length > 0 ? `${((approved / documents.length) * 100).toFixed(0)}% of total` : '0%'}
          icon={<CheckCircle className="w-5 md:w-6 h-5 md:h-6" />}
          variant="success"
        />
        <StatCard
          title="Pending Review"
          value={pending}
          subtitle="Awaiting verification"
          icon={<Clock className="w-5 md:w-6 h-5 md:h-6" />}
          variant="warning"
        />
        <StatCard
          title="Active Faculty"
          value={facultyCount}
          subtitle="Registered users"
          icon={<Users className="w-5 md:w-6 h-5 md:h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Criteria-wise Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={criteriaStats} barGap={0}>
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
                  <Bar dataKey="completed" fill="hsl(142, 71%, 45%)" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="hsl(38, 92%, 50%)" name="Pending" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] sm:h-[200px] md:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 sm:gap-4 mt-2 flex-wrap">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-xs sm:text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Document</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Criteria</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Faculty</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Year</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-medium truncate max-w-[150px]">{doc.fileName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{doc.subCriteria}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{doc.facultyName}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{doc.academicYear}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.iqacStatus.toLowerCase() as 'pending' | 'approved' | 'rejected'} />
                    </td>
                  </tr>
                ))}
                {recentDocuments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No documents uploaded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
