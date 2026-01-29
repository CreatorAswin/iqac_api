import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocuments, useStats } from '@/hooks/useApiData';
import { naacCriteria } from '@/data/criteriaData';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Loader2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export function ManagementDashboard() {
  const { documents, isLoading: docsLoading } = useDocuments();
  const { stats, isLoading: statsLoading } = useStats();

  const isLoading = docsLoading || statsLoading;

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
  const total = documents.length;

  const pieData = [
    { name: 'Approved', value: approved },
    { name: 'Pending', value: pending },
    { name: 'Rejected', value: rejected },
  ];

  const criteriaStats = naacCriteria.map(c => {
    const docs = documents.filter(d => d.criteria === String(c.number));
    const completed = docs.filter(d => d.iqacStatus === 'Approved').length;
    const criteriaTotal = docs.length || 1;
    return {
      criteria: `C${c.number}`,
      completed,
      pending: docs.filter(d => d.iqacStatus === 'Pending').length,
      total: docs.length,
      percentage: Math.round((completed / criteriaTotal) * 100),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">AQAR progress overview and institutional metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Completion"
          value={total > 0 ? `${Math.round((approved / total) * 100)}%` : '0%'}
          subtitle="Documents approved"
          icon={<TrendingUp className="w-5 md:w-6 h-5 md:h-6" />}
          variant="primary"
        />
        <StatCard
          title="Approved Documents"
          value={approved}
          icon={<CheckCircle className="w-5 md:w-6 h-5 md:h-6" />}
          variant="success"
        />
        <StatCard
          title="Pending Review"
          value={pending}
          icon={<Clock className="w-5 md:w-6 h-5 md:h-6" />}
          variant="warning"
        />
        <StatCard
          title="Rejected"
          value={rejected}
          icon={<XCircle className="w-5 md:w-6 h-5 md:h-6" />}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Criteria-wise Completion (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={criteriaStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="criteria" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={40} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value}%`, 'Completion']}
                  />
                  <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] md:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 md:gap-6 mt-4 flex-wrap">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm font-medium">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Criteria Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Criteria</th>
                  <th className="text-center py-3 px-4 font-medium">Total</th>
                  <th className="text-center py-3 px-4 font-medium">Completed</th>
                  <th className="text-center py-3 px-4 font-medium hidden sm:table-cell">Pending</th>
                  <th className="text-center py-3 px-4 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {criteriaStats.map((criteria) => (
                  <tr key={criteria.criteria} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{criteria.criteria}</td>
                    <td className="py-3 px-4 text-center">{criteria.total}</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-medium">{criteria.completed}</td>
                    <td className="py-3 px-4 text-center text-amber-600 font-medium hidden sm:table-cell">{criteria.pending}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${criteria.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{criteria.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
