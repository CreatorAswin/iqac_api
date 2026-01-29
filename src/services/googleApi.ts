// Google Apps Script API Integration
// Replace this URL with your deployed Google Apps Script Web App URL
const API_BASE_URL = (import.meta as any).env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbw0tjZIkoEusoISbWj3A5uw4ZVugRlcrYQCiB3fNb6dd42dq09wTlEhCvoNTr7mJmmy/exec';

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

class GoogleApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(action: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    if (!this.baseUrl) {
      console.warn('Google Apps Script URL not configured. Using mock data.');
      throw new Error('API not configured');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script requirement
        },
        body: JSON.stringify({ action, ...data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    return this.request<User>('login', { email, password });
  }

  // Documents
  async getDocuments(filters?: {
    facultyId?: string;
    criteria?: string;
    year?: string;
    status?: string;
  }): Promise<ApiResponse<Document[]>> {
    return this.request<Document[]>('getDocuments', filters);
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
    // For file uploads, we need to convert file to base64
    const base64 = await this.fileToBase64(data.file);

    const payload = {
      action: 'uploadDocument',
      fileName: data.file.name,
      fileData: base64,
      mimeType: data.file.type,
      criteria: data.criteria,
      subCriteria: data.subCriteria,
      academicYear: data.academicYear,
      facultyId: data.facultyId,
      facultyName: data.facultyName,
      remarks: data.remarks,
      documentId: data.documentId,
    };

    try {
      if (!this.baseUrl) {
        console.warn('Google Apps Script URL not configured. Using mock data.');
        throw new Error('API not configured');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script requirement
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload request failed:', error);
      throw error;
    }
  }

  async updateDocumentStatus(data: {
    documentId: string;
    status: 'Approved' | 'Rejected';
    remarks?: string;
    approvedBy: string;
  }): Promise<ApiResponse<Document>> {
    const response = await this.request<Document>('updateDocumentStatus', data);
    return response;
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('deleteDocument', { documentId });
  }

  // Users
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('getUsers');
  }

  async createUser(user: Omit<User, 'id'>): Promise<ApiResponse<User>> {
    return this.request<User>('createUser', user);
  }

  async updateUser(user: User): Promise<ApiResponse<User>> {
    return this.request<User>('updateUser', user as unknown as Record<string, unknown>);
  }

  async deleteUser(userId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('deleteUser', { userId });
  }

  // Assignments
  async getAssignments(facultyId?: string): Promise<ApiResponse<Assignment[]>> {
    return this.request<Assignment[]>('getAssignments', { facultyId });
  }

  async createAssignment(assignment: Omit<Assignment, 'id'>): Promise<ApiResponse<Assignment>> {
    return this.request<Assignment>('createAssignment', assignment);
  }

  async deleteAssignment(assignmentId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('deleteAssignment', { assignmentId });
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
    return this.request('getStats');
  }

  // Helper function to convert file to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}

export const googleApi = new GoogleApiService();
