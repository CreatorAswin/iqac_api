import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments, useAssignments } from '@/hooks/useApiData';
import { naacCriteria } from '@/data/criteriaData';
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FacultyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { documents, isLoading: docsLoading } = useDocuments({ facultyId: user?.email });
  const { assignments, isLoading: assignmentsLoading } = useAssignments(user?.email);

  const isLoading = docsLoading || assignmentsLoading;

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

  const rejectedDocuments = documents.filter(d => d.iqacStatus === 'Rejected');

  // Combine documents and assignments to show all assigned work
  // First, create a map of documents by subCriteria for the current faculty
  const documentMap = {};
  documents.forEach(doc => {
    // Only include documents that belong to the current faculty user
    if (doc.facultyId === user?.email) {
      if (!documentMap[doc.subCriteria]) {
        documentMap[doc.subCriteria] = [];
      }
      documentMap[doc.subCriteria].push(doc);
    }
  });

  // Combine assignments with documents
  const allItems = [];

  // Add assignments with or without documents
  if (assignments.length > 0) {
    assignments.forEach(assignment => {
      // Handle different criteriaId formats (e.g., "c1" vs "1")
      const normalizedCriteriaId = assignment.criteriaId.startsWith('c') ? assignment.criteriaId.substring(1) : assignment.criteriaId;
      const docs = documentMap[assignment.subCriteriaId] || [];

      // Try to find corresponding criteria/subcriteria info
      let criteriaInfo = naacCriteria.find(c => c.id === assignment.criteriaId);
      if (!criteriaInfo) {
        // Try normalized format
        criteriaInfo = naacCriteria.find(c => String(c.number) === normalizedCriteriaId);
      }

      const subCriteriaInfo = criteriaInfo?.subCriteria.find(sc => sc.code === assignment.subCriteriaId);

      allItems.push({
        subCriteria: assignment.subCriteriaId,
        criteria: assignment.criteriaId,
        criteriaTitle: criteriaInfo?.title || `Criteria ${assignment.criteriaId}`,
        subCriteriaTitle: subCriteriaInfo?.title || `Sub-criteria ${assignment.subCriteriaId}`,
        documents: docs,
        assignmentId: assignment.id,
        assignedBy: assignment.assignedBy,
        assignedDate: assignment.assignedDate,
      });
    });
  }

  // Add documents that don't have corresponding assignments (if any)
  Object.entries(documentMap).forEach(([subCriteria, docs]) => {
    const exists = allItems.some(item => item.subCriteria === subCriteria);
    if (!exists) {
      // Find criteria info for this subCriteria
      let criteriaInfo, subCriteriaInfo;
      for (const criteria of naacCriteria) {
        const sub = criteria.subCriteria.find(sc => sc.code === subCriteria);
        if (sub) {
          criteriaInfo = criteria;
          subCriteriaInfo = sub;
          break;
        }
      }

      allItems.push({
        subCriteria,
        criteria: criteriaInfo?.id || 'unknown',
        criteriaTitle: criteriaInfo?.title || 'Unknown Criteria',
        subCriteriaTitle: subCriteriaInfo?.title || `Sub-criteria ${subCriteria}`,
        documents: docs,
        assignmentId: null,
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your assigned criteria and document uploads</p>
        </div>
        <Button onClick={() => navigate('/upload')}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Criteria"
          value={allItems.length}
          subtitle="Total criteria to complete"
          icon={<FileText className="w-5 md:w-6 h-5 md:h-6" />}
          variant="primary"
        />
        <StatCard
          title="Approved"
          value={approved}
          subtitle="Documents verified"
          icon={<CheckCircle className="w-5 md:w-6 h-5 md:h-6" />}
          variant="success"
        />
        <StatCard
          title="Pending"
          value={pending}
          subtitle="Awaiting review"
          icon={<Clock className="w-5 md:w-6 h-5 md:h-6" />}
          variant="warning"
        />
        <StatCard
          title="Declined"
          value={rejected}
          subtitle="Needs re-upload"
          icon={<XCircle className="w-5 md:w-6 h-5 md:h-6" />}
          variant="danger"
        />
      </div>

      {rejectedDocuments.length > 0 && (
        <Card className="border-rose-200 bg-rose-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              Declined Documents - Re-upload Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rejectedDocuments.map((doc) => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 bg-white rounded-lg border border-rose-200 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-medium truncate">{doc.fileName}</span>
                    <StatusBadge status="rejected" showIcon={false} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {doc.subCriteria} • {doc.academicYear}
                  </p>
                  {doc.remarks && (
                    <div className="text-sm text-rose-700 bg-rose-100 p-2 rounded">
                      <strong>Reason:</strong> {doc.remarks}
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => navigate('/upload', { state: { reuploadDocument: doc } })}>
                  <Upload className="w-4 h-4 mr-1" />
                  Re-upload
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            My Assigned Criteria ({allItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No criteria assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allItems.map((item, index) => {
                // Get the most recent document for this sub-criteria
                const mostRecentDoc = item.documents.length > 0
                  ? item.documents[item.documents.length - 1]
                  : null;

                return (
                  <div key={`${item.subCriteria}-${index}`} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                            {item.subCriteria}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {item.criteriaTitle}
                          </span>
                        </div>
                        <p className="text-base font-medium mb-2">
                          {item.subCriteriaTitle}
                        </p>

                        {mostRecentDoc && (
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm">{mostRecentDoc.fileName}</span>
                            <a
                              href={mostRecentDoc.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="min-w-[120px]">
                          {mostRecentDoc ? (
                            <StatusBadge status={mostRecentDoc.iqacStatus.toLowerCase() as 'pending' | 'approved' | 'rejected'} />
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Not Started
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {mostRecentDoc?.remarks && (
                      <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                        <strong className="text-muted-foreground">Remarks:</strong> {mostRecentDoc.remarks}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No activity yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${doc.iqacStatus === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                    doc.iqacStatus === 'Rejected' ? 'bg-rose-100 text-rose-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                    {doc.iqacStatus === 'Approved' ? <CheckCircle className="w-5 h-5" /> :
                      doc.iqacStatus === 'Rejected' ? <XCircle className="w-5 h-5" /> :
                        <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.subCriteria} • Uploaded on {new Date(doc.date).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={doc.iqacStatus.toLowerCase() as 'pending' | 'approved' | 'rejected'} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}