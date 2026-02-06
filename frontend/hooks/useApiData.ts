import { useMemo } from 'react';
import { Document, User as ApiUser, Assignment } from '@/services/localApi';
import { useData } from '@/contexts/DataContext';

// Hook for fetching documents
export function useDocuments(filters?: {
  facultyId?: string;
  criteria?: string;
  year?: string;
  status?: string;
}) {
  const {
    documents: allDocuments,
    documentsLoading: isLoading,
    documentsError: error,
    refetchDocuments: refetch,
    setDocuments
  } = useData();

  // Apply client-side filtering
  const documents = useMemo(() => {
    if (!filters) return allDocuments;

    return allDocuments.filter(doc => {
      if (filters.facultyId && doc.facultyId !== filters.facultyId) return false;
      if (filters.criteria && doc.criteria !== filters.criteria) return false;
      if (filters.year && doc.academicYear !== filters.year) return false;
      if (filters.status && doc.iqacStatus !== filters.status) return false;
      return true;
    });
  }, [allDocuments, filters]);

  return { documents, isLoading, error, refetch, setDocuments };
}

// Hook for fetching users
export function useUsers() {
  const {
    users,
    usersLoading: isLoading,
    usersError: error,
    refetchUsers: refetch,
    setUsers
  } = useData();

  return { users, isLoading, error, refetch, setUsers };
}

// Hook for fetching assignments
export function useAssignments(facultyId?: string) {
  const {
    assignments: allAssignments,
    assignmentsLoading: isLoading,
    assignmentsError: error,
    refetchAssignments: refetch,
    setAssignments
  } = useData();

  // Apply client-side filtering by facultyId if provided
  const assignments = useMemo(() => {
    if (!facultyId) return allAssignments;
    return allAssignments.filter(assignment => assignment.facultyId === facultyId);
  }, [allAssignments, facultyId]);

  return { assignments, isLoading, error, refetch, setAssignments };
}

// Hook for fetching statistics
export function useStats() {
  const {
    stats,
    statsLoading: isLoading,
    statsError: error,
    refetchStats: refetch
  } = useData();

  return { stats, isLoading, error, refetch };
}

// Helper to get faculty users only
export function useFacultyUsers() {
  const { users, isLoading, error, refetch } = useUsers();
  const facultyUsers = users.filter(u => u.role.toLowerCase() === 'faculty');
  return { faculty: facultyUsers, isLoading, error, refetch };
}
