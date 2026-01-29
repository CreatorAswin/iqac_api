import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { localApi, Document, User as ApiUser, Assignment } from '@/services/localApi';

interface StatsData {
    totalDocuments: number;
    approved: number;
    pending: number;
    rejected: number;
    byYear: Record<string, number>;
    byCriteria: Record<string, { completed: number; pending: number }>;
}

interface DataContextType {
    // Documents
    documents: Document[];
    documentsLoading: boolean;
    documentsError: string | null;
    refetchDocuments: () => Promise<void>;
    setDocuments: (docs: Document[] | ((prev: Document[]) => Document[])) => void;

    // Users
    users: ApiUser[];
    usersLoading: boolean;
    usersError: string | null;
    refetchUsers: () => Promise<void>;
    setUsers: (users: ApiUser[] | ((prev: ApiUser[]) => ApiUser[])) => void;

    // Assignments
    assignments: Assignment[];
    assignmentsLoading: boolean;
    assignmentsError: string | null;
    refetchAssignments: () => Promise<void>;
    setAssignments: (assignments: Assignment[] | ((prev: Assignment[]) => Assignment[])) => void;

    // Stats
    stats: StatsData | null;
    statsLoading: boolean;
    statsError: string | null;
    refetchStats: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    // Documents state
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(true);
    const [documentsError, setDocumentsError] = useState<string | null>(null);

    // Users state
    const [users, setUsers] = useState<ApiUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);

    // Assignments state
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(true);
    const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

    // Stats state
    const [stats, setStats] = useState<StatsData | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);

    // Fetch documents
    const fetchDocuments = useCallback(async () => {
        setDocumentsLoading(true);
        setDocumentsError(null);
        try {
            const response = await localApi.getDocuments();
            if (response.success && response.data) {
                setDocuments(response.data);
            } else {
                setDocumentsError(response.error || 'Failed to fetch documents');
            }
        } catch (err) {
            setDocumentsError('Failed to connect to server');
            console.error('Error fetching documents:', err);
        } finally {
            setDocumentsLoading(false);
        }
    }, []);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        setUsersError(null);
        try {
            const response = await localApi.getUsers();
            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                setUsersError(response.error || 'Failed to fetch users');
            }
        } catch (err) {
            setUsersError('Failed to connect to server');
            console.error('Error fetching users:', err);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    // Fetch assignments
    const fetchAssignments = useCallback(async () => {
        setAssignmentsLoading(true);
        setAssignmentsError(null);
        try {
            const response = await localApi.getAssignments();
            if (response.success && response.data) {
                setAssignments(response.data);
            } else {
                setAssignmentsError(response.error || 'Failed to fetch assignments');
            }
        } catch (err) {
            setAssignmentsError('Failed to connect to server');
            console.error('Error fetching assignments:', err);
        } finally {
            setAssignmentsLoading(false);
        }
    }, []);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        setStatsError(null);
        try {
            const response = await localApi.getStats();
            if (response.success && response.data) {
                setStats(response.data);
            } else {
                setStatsError(response.error || 'Failed to fetch statistics');
            }
        } catch (err) {
            setStatsError('Failed to connect to server');
            console.error('Error fetching stats:', err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // Load all data once on mount
    useEffect(() => {
        fetchDocuments();
        fetchUsers();
        fetchAssignments();
        fetchStats();
    }, [fetchDocuments, fetchUsers, fetchAssignments, fetchStats]);

    const value: DataContextType = {
        documents,
        documentsLoading,
        documentsError,
        refetchDocuments: fetchDocuments,
        setDocuments,

        users,
        usersLoading,
        usersError,
        refetchUsers: fetchUsers,
        setUsers,

        assignments,
        assignmentsLoading,
        assignmentsError,
        refetchAssignments: fetchAssignments,
        setAssignments,

        stats,
        statsLoading,
        statsError,
        refetchStats: fetchStats,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
