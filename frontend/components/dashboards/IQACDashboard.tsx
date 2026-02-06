import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDocuments, useFacultyUsers } from '@/hooks/useApiData';
import { naacCriteria } from '@/data/criteriaData';
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function IQACDashboard() {
  const navigate = useNavigate();
  const { documents, isLoading: docsLoading } = useDocuments();
  const { faculty, isLoading: facultyLoading } = useFacultyUsers();

  const isLoading = docsLoading || facultyLoading;

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

  const pendingDocuments = documents.filter(d => d.iqacStatus === 'Pending').slice(0, 5);

  const facultyPending = faculty.map(f => ({
    ...f,
    pending: documents.filter(d => d.facultyId === f.email && d.iqacStatus === 'Pending').length,
    approved: documents.filter(d => d.facultyId === f.email && d.iqacStatus === 'Approved').length,
  }));

  const criteriaProgress = naacCriteria.map(c => {
    const docs = documents.filter(d => d.criteria === String(c.number));
    return {
      ...c,
      total: docs.length,
      approved: docs.filter(d => d.iqacStatus === 'Approved').length,
      pending: docs.filter(d => d.iqacStatus === 'Pending').length,
    };
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">IQAC Dashboard</h1>
          <p className="text-muted-foreground mt-1">Review and verify faculty document submissions</p>
        </div>
        <Button onClick={() => navigate('/verification')}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Review Documents
        </Button>
      </div>

      <div className="mobile-stat-grid">

        <StatCard
          title="Approved"
          value={approved}
          subtitle="Documents verified"
          icon={<CheckCircle className="w-5 md:w-6 h-5 md:h-6" />}
          variant="success"
        />
        <StatCard
          title="Pending Review"
          value={pending}
          subtitle="Needs verification"
          icon={<Clock className="w-5 md:w-6 h-5 md:h-6" />}
          variant="warning"
        />
        <StatCard
          title="Rejected"
          value={rejected}
          subtitle="Requires re-upload"
          icon={<XCircle className="w-5 md:w-6 h-5 md:h-6" />}
          variant="danger"
        />
        <StatCard
          title="Active Faculty"
          value={faculty.length}
          subtitle="Contributing members"
          icon={<Users className="w-5 md:w-6 h-5 md:h-6" />}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Criteria-wise Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {criteriaProgress.map((criteria) => {
              // Count faculty assigned to this criteria
              const facultyCount = new Set(
                documents
                  .filter(d => d.criteria === String(criteria.number))
                  .map(d => d.facultyId)
              ).size;

              const hasStarted = criteria.approved > 0;

              return (
                <div key={criteria.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-primary">C{criteria.number}</span>
                    <Badge
                      variant={hasStarted ? "default" : "secondary"}
                      className={hasStarted ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}
                    >
                      {hasStarted ? "Started" : "Not Started"}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-3 line-clamp-2">{criteria.title}</p>

                  <div className="space-y-2">
                    {/* Faculty Count */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Faculties
                      </span>
                      <span className="font-semibold text-foreground">{facultyCount}</span>
                    </div>

                    {/* Approved Documents */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </span>
                      <span className="font-semibold text-emerald-600">{criteria.approved}</span>
                    </div>

                    {/* Pending Documents - Only show if not started */}
                    {!hasStarted && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                        <span className="font-semibold text-amber-600">{criteria.pending}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {hasStarted && (
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{
                          width: criteria.total > 0
                            ? `${(criteria.approved / criteria.total) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Approval Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                <p>All documents have been reviewed!</p>
              </div>
            ) : (
              pendingDocuments.map((doc) => (
                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-8 h-8 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.subCriteria} • {doc.facultyName} • {doc.academicYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Faculty Upload Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {facultyPending.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No faculty members yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {facultyPending.map((f) => (
                  <div key={f.email} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {f.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{f.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="font-semibold text-amber-600">{f.pending}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Approved</p>
                        <p className="font-semibold text-emerald-600">{f.approved}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
