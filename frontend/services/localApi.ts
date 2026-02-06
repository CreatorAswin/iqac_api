// Local XAMPP Backend API Service
// RESTful API integration with JWT authentication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/aqar/backend';

export interface Document {
  id: string;
  date: string;
  criteria: string;
  subCriteria: string;
  facultyName: string;
  facultyId: string;
  academicYear: string;
  documentUrl: string;
  fileName: string;
  uploadStatus: 'Uploaded';
  iqacStatus: 'Pending' | 'Approved' | 'Rejected';
  remarks: string;
  approvedBy: string;
  approvedDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Management' | 'IQAC' | 'Faculty';
  status: 'Active' | 'Inactive';
}

export interface Assignment {
  id: string;
  facultyId: string;
  facultyName: string;
  criteriaId: string;
  subCriteriaId: string;
  assignedBy: string;
  assignedDate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

class LocalApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Get JWT token from localStorage
  private getToken(): string | null {
    return localStorage.getItem('iqac_token');
  }

  // Set JWT token in localStorage
  private setToken(token: string): void {
    localStorage.setItem('iqac_token', token);
  }

  // Remove JWT token from localStorage
  private removeToken(): void {
    localStorage.removeItem('iqac_token');
  }

  // Generic request method with JWT authentication
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add Content-Type for JSON requests (unless it's FormData)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        this.removeToken();
        localStorage.removeItem('iqac_user');
        // Don't throw error, return it in the response
        return {
          success: false,
          error: 'Unauthorized. Please login again.',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success && data.data?.token) {
      this.setToken(data.data.token);
    }

    return data;
  }

  async logout(): Promise<ApiResponse<boolean>> {
    const response = await this.request<boolean>('/auth/logout', {
      method: 'POST',
    });
    this.removeToken();
    return response;
  }

  async verifyToken(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/verify', {
      method: 'GET',
    });
  }

  // Documents
  async getDocuments(filters?: {
    facultyId?: string;
    criteria?: string;
    year?: string;
    status?: string;
  }): Promise<ApiResponse<Document[]>> {
    const params = new URLSearchParams();
    if (filters?.facultyId) params.append('facultyId', filters.facultyId);
    if (filters?.criteria) params.append('criteria', filters.criteria);
    if (filters?.year) params.append('year', filters.year);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = queryString ? `/documents?${queryString}` : '/documents';

    return this.request<Document[]>(endpoint, {
      method: 'GET',
    });
  }

  async uploadDocument(data: {
    file: File;
    criteria: string;
    subCriteria: string;
    academicYear: string;
    facultyId: string;
    facultyName: string;
    remarks?: string;
    documentId?: string;
  }): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('criteria', data.criteria);
    formData.append('subCriteria', data.subCriteria);
    formData.append('academicYear', data.academicYear);
    formData.append('facultyId', data.facultyId);
    formData.append('facultyName', data.facultyName);
    if (data.remarks) formData.append('remarks', data.remarks);
    if (data.documentId) formData.append('documentId', data.documentId);

    return this.request<Document>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async updateDocumentStatus(data: {
    documentId: string;
    status: 'Approved' | 'Rejected';
    remarks?: string;
    approvedBy: string;
  }): Promise<ApiResponse<Document>> {
    return this.request<Document>('/documents/update_status', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/documents/delete', {
      method: 'DELETE',
      body: JSON.stringify({ documentId }),
    });
  }

  // Users
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users', {
      method: 'GET',
    });
  }

  async createUser(user: Omit<User, 'id'>): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(user: User): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/users', {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }

  // Assignments
  async getAssignments(facultyId?: string): Promise<ApiResponse<Assignment[]>> {
    const endpoint = facultyId ? `/assignments?facultyId=${facultyId}` : '/assignments';
    return this.request<Assignment[]>(endpoint, {
      method: 'GET',
    });
  }

  async createAssignment(assignment: Omit<Assignment, 'id'>): Promise<ApiResponse<Assignment>> {
    return this.request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  async deleteAssignment(assignmentId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/assignments', {
      method: 'DELETE',
      body: JSON.stringify({ assignmentId }),
    });
  }

  // Statistics
  async getStats(): Promise<ApiResponse<{
    totalDocuments: number;
    approved: number;
    pending: number;
    rejected: number;
    byYear: Record<string, number>;
    byCriteria: Record<string, { completed: number; pending: number }>;
  }>> {
    return this.request('/stats', {
      method: 'GET',
    });
  }
}

export const localApi = new LocalApiService();
