import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { naacCriteria } from '@/data/criteriaData';
import { useDocuments, useAssignments, useFacultyUsers } from '@/hooks/useApiData';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Search,
  BookOpen,
  Loader2,
  User,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Criteria() {
  const { user } = useAuth();
  const { assignments, isLoading: assignmentsLoading } = useAssignments();
  const { documents: allDocuments, isLoading: docsLoading } = useDocuments();
  const { faculty, isLoading: facultyLoading } = useFacultyUsers();

  const [expandedCriteria, setExpandedCriteria] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');

  // For faculty users, show only assigned criteria
  const isFaculty = user?.role === 'faculty';

  // Group assignments by sub-criteria
  const subCriteriaAssignmentsMap = useMemo(() => {
    const map: Record<string, { facultyId: string; facultyName: string }[]> = {};

    assignments.forEach(assignment => {
      const subCriteriaId = assignment.subCriteriaId;
      if (!map[subCriteriaId]) {
        map[subCriteriaId] = [];
      }

      const facultyMember = faculty.find(f => f.email === assignment.facultyId);
      map[subCriteriaId].push({
        facultyId: assignment.facultyId,
        facultyName: facultyMember?.name || assignment.facultyId,
      });
    });

    return map;
  }, [assignments, faculty]);

  // Group assignments by criteria
  const criteriaFacultyMap = useMemo(() => {
    const map: Record<string, { facultyId: string; facultyName: string }[]> = {};

    assignments.forEach(assignment => {
      if (!map[assignment.criteriaId]) {
        map[assignment.criteriaId] = [];
      }

      const facultyMember = faculty.find(f => f.email === assignment.facultyId);
      map[assignment.criteriaId].push({
        facultyId: assignment.facultyId,
        facultyName: facultyMember?.name || assignment.facultyId,
      });
    });

    return map;
  }, [assignments, faculty]);

  // Get all documents by sub-criteria
  const subCriteriaDocumentsMap = useMemo(() => {
    const map: Record<string, typeof allDocuments> = {};

    allDocuments.forEach(doc => {
      if (!map[doc.subCriteria]) {
        map[doc.subCriteria] = [];
      }
      map[doc.subCriteria].push(doc);
    });

    return map;
  }, [allDocuments]);

  // Get assigned criteria IDs for faculty
  const assignedCriteriaIds = isFaculty ?
    [...new Set(assignments.map(a => a.criteriaId))] :
    naacCriteria.map(c => c.id);

  const assignedSubCriteriaCodes = isFaculty ?
    assignments.map(a => a.subCriteriaId) :
    [];

  const toggleCriteria = (id: string) => {
    setExpandedCriteria(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const getMostRecentDocument = (subCriteriaCode: string, facultyId?: string) => {
    // Find the most recent document for this sub-criteria
    const filterFacultyId = facultyId || user?.email;
    const docsForSubCriteria = allDocuments.filter(d =>
      d.subCriteria === subCriteriaCode && d.facultyId === filterFacultyId
    );

    if (docsForSubCriteria.length > 0) {
      // Return the most recent document
      return docsForSubCriteria[docsForSubCriteria.length - 1];
    }
    return null;
  };

  // Get unique years from documents
  const uniqueYears = useMemo(() => {
    const years = [...new Set(allDocuments.map(doc => doc.academicYear))].sort();
    return ['all', ...years];
  }, [allDocuments]);

  const filteredCriteria = naacCriteria
    .filter(c => assignedCriteriaIds.includes(c.id))
    .filter(c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subCriteria.some(sc =>
        sc.code.includes(searchQuery) ||
        sc.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .filter(c => {
      if (selectedYear === 'all') return true;
      // Check if any document for this criteria matches the selected year
      return allDocuments.some(doc =>
        doc.criteria === c.number.toString() && doc.academicYear === selectedYear
      );
    });

  if (isFaculty && (assignmentsLoading || docsLoading)) {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isFaculty ? 'My Assigned Criteria' : 'NAAC Criteria'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isFaculty
                ? `View and manage your assigned criteria (${assignments.length} assigned)`
                : 'View and manage all NAAC criteria and sub-criteria'
              }
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.slice(1).map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search criteria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(isFaculty && (assignmentsLoading || docsLoading)) ||
          (!isFaculty && (assignmentsLoading || docsLoading || facultyLoading)) ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredCriteria.length === 0 && isFaculty ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Assignments Found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't been assigned any criteria yet. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCriteria.map((criteria) => {
              const isExpanded = expandedCriteria.includes(criteria.id);

              return (
                <Card key={criteria.id} className="overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleCriteria(criteria.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <span className="text-xl font-bold text-primary-foreground">{criteria.number}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{criteria.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{criteria.description}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">{criteriaFacultyMap[criteria.id]?.length || 0} faculty assigned</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Sub-Criteria</TableHead>
                              <TableHead>Document</TableHead>
                              <TableHead className="w-[200px]">Faculty</TableHead>
                              <TableHead className="w-[150px]">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.subCriteria
                              // For faculty: filter to show only assigned sub-criteria
                              .filter(sc => !isFaculty || assignedSubCriteriaCodes.includes(sc.code))
                              .map((subCriteria) => {
                                // Get assigned faculty for this sub-criteria
                                const assignedFaculty = subCriteriaAssignmentsMap[subCriteria.code] || [];

                                // Get documents for this sub-criteria and filter by selected year
                                const allDocsForSubCriteria = subCriteriaDocumentsMap[subCriteria.code] || [];
                                const documentsForSubCriteria = selectedYear === 'all'
                                  ? allDocsForSubCriteria
                                  : allDocsForSubCriteria.filter(doc => doc.academicYear === selectedYear);

                                // If there are documents, show each document with its faculty and status
                                if (documentsForSubCriteria.length > 0) {
                                  return documentsForSubCriteria.map((doc, idx) => {
                                    const facultyMember = faculty.find(f => f.email === doc.facultyId);
                                    return (
                                      <TableRow key={`${subCriteria.code}-${doc.id}`}>
                                        {idx === 0 ? (
                                          <TableCell rowSpan={documentsForSubCriteria.length} className="align-top">
                                            <div className="flex items-center gap-2">
                                              <BookOpen className="w-4 h-4 text-primary" />
                                              <div>
                                                <div className="font-mono font-medium text-primary">{subCriteria.code}</div>
                                                <div className="text-sm text-muted-foreground">{subCriteria.title}</div>
                                              </div>
                                            </div>
                                          </TableCell>
                                        ) : null}
                                        <TableCell>
                                          <div className="font-medium truncate max-w-xs">{doc.fileName}</div>
                                          <div className="text-xs text-muted-foreground">
                                            Uploaded: {new Date(doc.date).toLocaleDateString()}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                              <div>{facultyMember?.name || doc.facultyName}</div>
                                              <div className="text-xs text-muted-foreground">{doc.facultyId}</div>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <StatusBadge status={doc.iqacStatus.toLowerCase() as 'pending' | 'approved' | 'rejected'} />
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 px-2"
                                              asChild
                                            >
                                              <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer">
                                                View
                                              </a>
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  });
                                } else {
                                  // If no documents but faculty is assigned
                                  if (assignedFaculty.length > 0) {
                                    return assignedFaculty.map((fac, idx) => (
                                      <TableRow key={`${subCriteria.code}-${fac.facultyId}`}>
                                        {idx === 0 ? (
                                          <TableCell rowSpan={assignedFaculty.length} className="align-top">
                                            <div className="flex items-center gap-2">
                                              <BookOpen className="w-4 h-4 text-primary" />
                                              <div>
                                                <div className="font-mono font-medium text-primary">{subCriteria.code}</div>
                                                <div className="text-sm text-muted-foreground">{subCriteria.title}</div>
                                              </div>
                                            </div>
                                          </TableCell>
                                        ) : null}
                                        <TableCell>
                                          <span className="text-muted-foreground italic">No documents uploaded</span>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                              <div>{fac.facultyName}</div>
                                              <div className="text-xs text-muted-foreground">{fac.facultyId}</div>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Not Started
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    ));
                                  } else {
                                    // If no documents and no assigned faculty
                                    return (
                                      <TableRow key={subCriteria.code}>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                            <div>
                                              <div className="font-mono font-medium text-primary">{subCriteria.code}</div>
                                              <div className="text-sm text-muted-foreground">{subCriteria.title}</div>
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-muted-foreground italic">No documents</span>
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-muted-foreground italic">Not assigned</span>
                                        </TableCell>
                                        <TableCell>
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Not Started
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  }
                                }
                              })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
