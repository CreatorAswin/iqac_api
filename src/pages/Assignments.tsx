import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { naacCriteria } from '@/data/criteriaData';
import { useFacultyUsers, useAssignments } from '@/hooks/useApiData';
import { localApi } from '@/services/localApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  ClipboardList,
  Plus,
  Trash2,
  User,
  BookOpen,
  Loader2,
  RefreshCw,
  Search,
  Users,
  Building,
} from 'lucide-react';

export default function Assignments() {
  const { user } = useAuth();
  const { faculty, isLoading: facultyLoading } = useFacultyUsers();
  const { assignments, isLoading: assignmentsLoading, refetch, setAssignments } = useAssignments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState('');
  const [selectedSubCriteria, setSelectedSubCriteria] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();

  const currentCriteria = naacCriteria.find(c => c.id === selectedCriteria);

  // Filter faculty based on search query
  const filteredFaculty = useMemo(() => {
    if (!searchQuery.trim()) return faculty;
    const query = searchQuery.toLowerCase();
    return faculty.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.email.toLowerCase().includes(query)
    );
  }, [faculty, searchQuery]);

  // Get unassigned faculty (those without any assignments)
  const unassignedFaculty = useMemo(() => {
    return faculty.filter(facultyMember =>
      !assignments.some(assignment => assignment.facultyId === facultyMember.email)
    );
  }, [faculty, assignments]);

  // Get assigned faculty (those who have assignments)
  const assignedFaculty = useMemo(() => {
    return faculty.filter(facultyMember =>
      assignments.some(assignment => assignment.facultyId === facultyMember.email)
    );
  }, [faculty, assignments]);

  const handleAddAssignment = async () => {
    if (!selectedFaculty || !selectedCriteria || !selectedSubCriteria || !user) {
      toast({
        title: 'Missing fields',
        description: 'Please select all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const facultyMember = faculty.find(f => f.email === selectedFaculty);
    if (!facultyMember) return;

    setIsSubmitting(true);
    try {
      const response = await localApi.createAssignment({
        facultyId: selectedFaculty,
        facultyName: facultyMember.name,
        criteriaId: selectedCriteria,
        subCriteriaId: selectedSubCriteria,
        assignedBy: user.email,
        assignedDate: new Date().toISOString().split('T')[0],
      });

      if (response.success && response.data) {
        setAssignments(prev => [...prev, response.data!]);
        toast({
          title: 'Assignment created',
          description: `${selectedSubCriteria} assigned to ${facultyMember.name}`,
        });
        setIsDialogOpen(false);
        setSelectedFaculty('');
        setSelectedCriteria('');
        setSelectedSubCriteria('');
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create assignment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await localApi.deleteAssignment(id);
      if (response.success) {
        setAssignments(prev => prev.filter(a => a.id !== id));
        toast({
          title: 'Assignment removed',
          description: 'The assignment has been deleted.',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete assignment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const groupedAssignments = faculty.map(f => ({
    ...f,
    assignments: assignments.filter(a => a.facultyId === f.email),
  }));

  const isLoading = facultyLoading || assignmentsLoading;

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Criteria Assignments</h1>
            <p className="text-muted-foreground mt-1">Assign sub-criteria to faculty members</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Assign a sub-criteria to a faculty member for document upload.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Faculty Member</label>
                    <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculty.map((f) => (
                          <SelectItem key={f.email} value={f.email}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Criteria</label>
                    <Select value={selectedCriteria} onValueChange={(value) => {
                      setSelectedCriteria(value);
                      setSelectedSubCriteria('');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select criteria" />
                      </SelectTrigger>
                      <SelectContent>
                        {naacCriteria.map((criteria) => (
                          <SelectItem key={criteria.id} value={criteria.id}>
                            C{criteria.number}: {criteria.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sub-Criteria</label>
                    <Select
                      value={selectedSubCriteria}
                      onValueChange={setSelectedSubCriteria}
                      disabled={!selectedCriteria}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-criteria" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentCriteria?.subCriteria.map((subCriteria) => (
                          <SelectItem key={subCriteria.id} value={subCriteria.code}>
                            {subCriteria.code}: {subCriteria.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAssignment} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Create Assignment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-8">
          {/* Unassigned Faculty Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Unassigned Faculty</h2>
              <Badge variant="secondary">{unassignedFaculty.length}</Badge>
            </div>

            {unassignedFaculty.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">All faculty members are assigned</p>
                  <p>No faculty members are currently unassigned</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {unassignedFaculty.map((f) => (
                  <Card key={f.email}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{f.name}</p>
                          <p className="text-sm font-normal text-muted-foreground truncate">{f.email}</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6 text-muted-foreground">
                        <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No assignments yet</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Faculty Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Assigned Faculty</h2>
              <Badge variant="secondary">{assignedFaculty.length}</Badge>
            </div>

            {assignedFaculty.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No assignments created</p>
                  <p>Start by assigning criteria to faculty members</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assignedFaculty.map((f) => {
                  const facultyAssignments = assignments.filter(a => a.facultyId === f.email);
                  return (
                    <Card key={f.email}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{f.name}</p>
                            <p className="text-sm font-normal text-muted-foreground truncate">{f.email}</p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {facultyAssignments.map((assignment) => {
                            const criteria = naacCriteria.find(c => c.id === assignment.criteriaId);
                            const subCriteria = criteria?.subCriteria.find(sc => sc.code === assignment.subCriteriaId);

                            return (
                              <div
                                key={assignment.id}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      <span className="font-mono text-primary">{assignment.subCriteriaId}</span>
                                      {' '}{subCriteria?.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {criteria?.title}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive shrink-0"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  disabled={deletingId === assignment.id}
                                >
                                  {deletingId === assignment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
