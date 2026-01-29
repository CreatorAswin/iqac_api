import { User } from '@/contexts/AuthContext';

export interface Document {
  id: string;
  criteriaId: string;
  subCriteriaCode: string;
  facultyId: string;
  facultyName: string;
  academicYear: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  uploadStatus: 'uploaded';
  iqacStatus: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface Assignment {
  id: string;
  facultyId: string;
  facultyName: string;
  criteriaId: string;
  subCriteriaCode: string;
  assignedBy: string;
  assignedDate: string;
}

export const mockFaculty: User[] = [
  { id: 'f1', name: 'Dr. Rajesh Kumar', email: 'rajesh@college.edu', role: 'faculty', status: 'active' },
  { id: 'f2', name: 'Dr. Priya Sharma', email: 'priya@college.edu', role: 'faculty', status: 'active' },
  { id: 'f3', name: 'Dr. Amit Patel', email: 'amit@college.edu', role: 'faculty', status: 'active' },
  { id: 'f4', name: 'Dr. Sunita Verma', email: 'sunita@college.edu', role: 'faculty', status: 'active' },
  { id: 'f5', name: 'Dr. Vikram Singh', email: 'vikram@college.edu', role: 'faculty', status: 'active' },
];

export const mockDocuments: Document[] = [
  {
    id: 'd1',
    criteriaId: 'c1',
    subCriteriaCode: '1.1.1',
    facultyId: 'f1',
    facultyName: 'Dr. Rajesh Kumar',
    academicYear: '2023-24',
    fileName: 'Curriculum_Review_Minutes.pdf',
    fileUrl: 'https://drive.google.com/file/d/xxx',
    uploadDate: '2024-01-15',
    uploadStatus: 'uploaded',
    iqacStatus: 'approved',
    approvedBy: 'IQAC Coordinator',
    approvedDate: '2024-01-18',
  },
  {
    id: 'd2',
    criteriaId: 'c2',
    subCriteriaCode: '2.1.1',
    facultyId: 'f2',
    facultyName: 'Dr. Priya Sharma',
    academicYear: '2023-24',
    fileName: 'Enrollment_Data.xlsx',
    fileUrl: 'https://drive.google.com/file/d/yyy',
    uploadDate: '2024-01-20',
    uploadStatus: 'uploaded',
    iqacStatus: 'pending',
  },
  {
    id: 'd3',
    criteriaId: 'c3',
    subCriteriaCode: '3.1.1',
    facultyId: 'f3',
    facultyName: 'Dr. Amit Patel',
    academicYear: '2023-24',
    fileName: 'Research_Grant_Proof.pdf',
    fileUrl: 'https://drive.google.com/file/d/zzz',
    uploadDate: '2024-01-22',
    uploadStatus: 'uploaded',
    iqacStatus: 'rejected',
    rejectionReason: 'Document is not clearly legible. Please upload a higher quality scan.',
  },
  {
    id: 'd4',
    criteriaId: 'c1',
    subCriteriaCode: '1.2.1',
    facultyId: 'f1',
    facultyName: 'Dr. Rajesh Kumar',
    academicYear: '2024-25',
    fileName: 'New_Courses_List.pdf',
    fileUrl: 'https://drive.google.com/file/d/aaa',
    uploadDate: '2024-02-01',
    uploadStatus: 'uploaded',
    iqacStatus: 'pending',
  },
  {
    id: 'd5',
    criteriaId: 'c4',
    subCriteriaCode: '4.1.1',
    facultyId: 'f4',
    facultyName: 'Dr. Sunita Verma',
    academicYear: '2023-24',
    fileName: 'Infrastructure_Report.pdf',
    fileUrl: 'https://drive.google.com/file/d/bbb',
    uploadDate: '2024-02-05',
    uploadStatus: 'uploaded',
    iqacStatus: 'approved',
    approvedBy: 'IQAC Coordinator',
    approvedDate: '2024-02-08',
  },
  {
    id: 'd6',
    criteriaId: 'c5',
    subCriteriaCode: '5.1.1',
    facultyId: 'f5',
    facultyName: 'Dr. Vikram Singh',
    academicYear: '2023-24',
    fileName: 'Scholarship_List.xlsx',
    fileUrl: 'https://drive.google.com/file/d/ccc',
    uploadDate: '2024-02-10',
    uploadStatus: 'uploaded',
    iqacStatus: 'pending',
  },
];

export const mockAssignments: Assignment[] = [
  { id: 'a1', facultyId: 'f1', facultyName: 'Dr. Rajesh Kumar', criteriaId: 'c1', subCriteriaCode: '1.1.1', assignedBy: 'IQAC', assignedDate: '2024-01-01' },
  { id: 'a2', facultyId: 'f1', facultyName: 'Dr. Rajesh Kumar', criteriaId: 'c1', subCriteriaCode: '1.2.1', assignedBy: 'IQAC', assignedDate: '2024-01-01' },
  { id: 'a3', facultyId: 'f2', facultyName: 'Dr. Priya Sharma', criteriaId: 'c2', subCriteriaCode: '2.1.1', assignedBy: 'IQAC', assignedDate: '2024-01-01' },
  { id: 'a4', facultyId: 'f3', facultyName: 'Dr. Amit Patel', criteriaId: 'c3', subCriteriaCode: '3.1.1', assignedBy: 'IQAC', assignedDate: '2024-01-01' },
  { id: 'a5', facultyId: 'f4', facultyName: 'Dr. Sunita Verma', criteriaId: 'c4', subCriteriaCode: '4.1.1', assignedBy: 'IQAC', assignedDate: '2024-01-01' },
  { id: 'a6', facultyId: 'f5', facultyName: 'Dr. Vikram Singh', criteriaId: 'c5', subCriteriaCode: '5.1.1', assignedBy: 'IQAC', assignedDate: '2024-01-01' },
];

export const getDocumentStats = () => {
  const total = mockDocuments.length;
  const approved = mockDocuments.filter(d => d.iqacStatus === 'approved').length;
  const pending = mockDocuments.filter(d => d.iqacStatus === 'pending').length;
  const rejected = mockDocuments.filter(d => d.iqacStatus === 'rejected').length;

  return { total, approved, pending, rejected };
};

export const getCriteriaStats = () => {
  const criteriaProgress = [
    { criteria: 'C1', completed: 25, pending: 10, total: 35 },
    { criteria: 'C2', completed: 30, pending: 15, total: 45 },
    { criteria: 'C3', completed: 20, pending: 20, total: 40 },
    { criteria: 'C4', completed: 15, pending: 5, total: 20 },
    { criteria: 'C5', completed: 22, pending: 8, total: 30 },
    { criteria: 'C6', completed: 18, pending: 12, total: 30 },
    { criteria: 'C7', completed: 10, pending: 5, total: 15 },
  ];

  return criteriaProgress;
};

export const getYearlyProgress = () => {
  return [
    { year: '2020-21', completed: 85, pending: 10, rejected: 5 },
    { year: '2021-22', completed: 78, pending: 15, rejected: 7 },
    { year: '2022-23', completed: 92, pending: 5, rejected: 3 },
    { year: '2023-24', completed: 65, pending: 28, rejected: 7 },
    { year: '2024-25', completed: 30, pending: 60, rejected: 10 },
  ];
};
