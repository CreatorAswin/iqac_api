import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import { naacCriteria, academicYears } from '@/data/criteriaData';
import { useDocuments } from '@/hooks/useApiData';
import { localApi, Document } from '@/services/localApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function Verification() {
  const { user } = useAuth();
  const { documents, isLoading, error, refetch, setDocuments } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [criteriaFilter, setCriteriaFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { toast } = useToast();

  const pendingDocs = documents.filter(d => d.iqacStatus === 'Pending');
  const approvedDocs = documents.filter(d => d.iqacStatus === 'Approved');
  const rejectedDocs = documents.filter(d => d.iqacStatus === 'Rejected');

  const filterDocuments = (docs: Document[]) => {
    return docs.filter(doc => {
      const matchesSearch =
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subCriteria.includes(searchQuery);

      const matchesCriteria = criteriaFilter === 'all' || doc.criteria === criteriaFilter.replace('c', '');
      const matchesYear = yearFilter === 'all' || doc.academicYear === yearFilter;

      return matchesSearch && matchesCriteria && matchesYear;
    });
  };

  const handleApprove = async (doc: Document) => {
    if (!user) return;

    setProcessingId(doc.id);
    try {
      console.log('Attempting to approve document:', doc.id, doc.fileName);
      const response = await localApi.updateDocumentStatus({
        documentId: doc.id,
        status: 'Approved',
        approvedBy: user.name,
      });
      console.log('Approval response:', response);

      if (response.success) {
        setDocuments(prev => prev.map(d =>
          d.id === doc.id
            ? { ...d, iqacStatus: 'Approved' as const, approvedBy: user.name, approvedDate: new Date().toISOString().split('T')[0] }
            : d
        ));

        toast({
          title: 'Document Approved',
          description: `${doc.fileName} has been approved successfully.`,
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to approve document',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Approval error:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to server: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedDoc || !rejectReason.trim() || !user) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }

    setProcessingId(selectedDoc.id);
    try {
      console.log('Attempting to reject document:', selectedDoc.id, selectedDoc.fileName);
      const response = await localApi.updateDocumentStatus({
        documentId: selectedDoc.id,
        status: 'Rejected',
        remarks: rejectReason,
        approvedBy: user.name,
      });
      console.log('Rejection response:', response);

      if (response.success) {
        setDocuments(prev => prev.map(d =>
          d.id === selectedDoc.id
            ? { ...d, iqacStatus: 'Rejected' as const, remarks: rejectReason }
            : d
        ));

        toast({
          title: 'Document Rejected',
          description: `${selectedDoc.fileName} has been rejected.`,
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to reject document',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Rejection error:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to server: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
      setIsRejectDialogOpen(false);
      setSelectedDoc(null);
      setRejectReason('');
    }
  };

  const openRejectDialog = (doc: Document) => {
    setSelectedDoc(doc);
    setIsRejectDialogOpen(true);
  };

  const DocumentCard = ({ doc }: { doc: Document }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-card border rounded-lg hover:shadow-md transition-shadow gap-4">
      <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-medium truncate">{doc.fileName}</p>
            <StatusBadge status={doc.iqacStatus.toLowerCase() as 'pending' | 'approved' | 'rejected'} />
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-muted-foreground">
            <span className="font-mono">{doc.subCriteria}</span>
            <span>{doc.facultyName}</span>
            <span>{doc.academicYear}</span>
            <span>{new Date(doc.date).toLocaleDateString()}</span>
          </div>
          {doc.remarks && doc.iqacStatus === 'Rejected' && (
            <p className="text-sm text-rose-600 mt-1">
              <strong>Reason:</strong> {doc.remarks}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="outline" asChild>
          <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer">
            <Eye className="w-4 h-4 mr-1" />
            View
          </a>
        </Button>
        {doc.iqacStatus === 'Pending' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => handleApprove(doc)}
              disabled={processingId === doc.id}
            >
              {processingId === doc.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Approve</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => openRejectDialog(doc)}
              disabled={processingId === doc.id}
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Reject</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Document Verification</h1>
            <p className="text-muted-foreground mt-1">Review and verify uploaded documents</p>
          </div>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by filename, faculty, or criteria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={criteriaFilter} onValueChange={setCriteriaFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Criteria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Criteria</SelectItem>
                    {naacCriteria.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        C{c.number}: {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full md:w-36">
                    <SelectValue placeholder="Year" />
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
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="w-full md:w-auto flex">
            <TabsTrigger value="pending" className="gap-2 flex-1 md:flex-none">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Pending</span> ({filterDocuments(pendingDocs).length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2 flex-1 md:flex-none">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Approved</span> ({filterDocuments(approvedDocs).length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2 flex-1 md:flex-none">
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Rejected</span> ({filterDocuments(rejectedDocs).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {filterDocuments(pendingDocs).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No pending documents</p>
                  <p className="text-muted-foreground">All documents have been reviewed!</p>
                </CardContent>
              </Card>
            ) : (
              filterDocuments(pendingDocs).map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {filterDocuments(approvedDocs).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No approved documents</p>
                  <p className="text-muted-foreground">Approved documents will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              filterDocuments(approvedDocs).map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {filterDocuments(rejectedDocs).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No rejected documents</p>
                  <p className="text-muted-foreground">Rejected documents will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              filterDocuments(rejectedDocs).map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document.
            </DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">{selectedDoc.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDoc.subCriteria} • {selectedDoc.facultyName}
                  </p>
                </div>
              </div>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processingId !== null}>
              {processingId ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
