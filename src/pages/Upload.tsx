import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { naacCriteria, academicYears } from '@/data/criteriaData';
import { useAuth } from '@/contexts/AuthContext';
import { useAssignments } from '@/hooks/useApiData';
import { localApi } from '@/services/localApi';
import { useToast } from '@/hooks/use-toast';
import {
  Upload as UploadIcon,
  FileUp,
  CheckCircle,
  FileText,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Upload() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { assignments, isLoading: assignmentsLoading } = useAssignments(user?.email);

  // Detect reupload mode
  const reuploadDoc = location.state?.reuploadDocument;
  const isReuploadMode = !!reuploadDoc;

  const [selectedCriteria, setSelectedCriteria] = useState('');
  const [selectedSubCriteria, setSelectedSubCriteria] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [remarks, setRemarks] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { toast } = useToast();

  // Auto-populate form fields when in reupload mode
  useEffect(() => {
    if (reuploadDoc) {
      setSelectedCriteria(`c${reuploadDoc.criteria}`);
      setSelectedSubCriteria(reuploadDoc.subCriteria);
      setSelectedYear(reuploadDoc.academicYear);
      setRemarks(reuploadDoc.remarks || '');
    }
  }, [reuploadDoc]);

  // Get assigned criteria for faculty
  const assignedCriteriaIds = [...new Set(assignments.map(a => a.criteriaId))];
  const availableCriteria = naacCriteria.filter(c => assignedCriteriaIds.includes(c.id));

  const currentCriteria = naacCriteria.find(c => c.id === selectedCriteria);
  const availableSubCriteria = currentCriteria?.subCriteria.filter(sc =>
    assignments.some(a => a.subCriteriaId === sc.code || a.subCriteriaId === sc.id)
  ) || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCriteria || !selectedSubCriteria || !selectedYear || !file) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const response = await localApi.uploadDocument({
        file,
        criteria: selectedCriteria.replace('c', ''),
        subCriteria: selectedSubCriteria,
        academicYear: selectedYear,
        facultyId: user.email,
        facultyName: user.name,
        remarks,
        documentId: isReuploadMode ? reuploadDoc.id : undefined,
      });

      if (response.success) {
        setUploadSuccess(true);
        toast({
          title: isReuploadMode ? 'Document re-uploaded successfully!' : 'Document uploaded successfully!',
          description: 'Your document has been submitted for IQAC review.',
        });

        setTimeout(() => {
          setSelectedCriteria('');
          setSelectedSubCriteria('');
          setSelectedYear('');
          setRemarks('');
          setFile(null);
          setUploadSuccess(false);
          navigate('/upload', { replace: true, state: {} });
        }, 3000);
      } else {
        toast({
          title: 'Upload failed',
          description: response.error || 'Failed to upload document',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Unable to connect to server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-10 pb-10">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Upload Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your document has been submitted and is pending IQAC review.
              </p>
              <Button onClick={() => setUploadSuccess(false)}>
                Upload Another Document
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {isReuploadMode ? 'Re-upload Document' : 'Upload Document'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isReuploadMode
              ? 'Update your rejected document with a new file'
              : 'Submit proof documents for your assigned criteria'}
          </p>
        </div>

        {isReuploadMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-medium">Re-uploading: {reuploadDoc.fileName}</p>
                <p className="text-sm">Previous file will be replaced with your new upload</p>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5 text-primary" />
              Document Upload Form
            </CardTitle>
            <CardDescription>
              Select the criteria, academic year, and upload your proof document
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Assignments Available</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any criteria assigned for document upload.
                </p>
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded max-w-md mx-auto">
                  Contact your administrator to get assigned criteria for document submission.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="criteria">Criteria *</Label>
                    <Select value={selectedCriteria} onValueChange={(value) => {
                      setSelectedCriteria(value);
                      setSelectedSubCriteria('');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select criteria" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCriteria.map((criteria) => (
                          <SelectItem key={criteria.id} value={criteria.id}>
                            C{criteria.number}: {criteria.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subCriteria">Sub-Criteria *</Label>
                    <Select
                      value={selectedSubCriteria}
                      onValueChange={setSelectedSubCriteria}
                      disabled={!selectedCriteria}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-criteria" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubCriteria.map((subCriteria) => (
                          <SelectItem key={subCriteria.id} value={subCriteria.code}>
                            {subCriteria.code}: {subCriteria.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year *</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full md:w-1/2">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Document *</Label>
                  {!file ? (
                    <div className="border-2 border-dashed rounded-lg p-6 md:p-8 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <FileUp className="w-10 md:w-12 h-10 md:h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT (Max 10MB)
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="w-8 h-8 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Add any additional notes or comments..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" className="order-2 sm:order-1" onClick={() => {
                    setSelectedCriteria('');
                    setSelectedSubCriteria('');
                    setSelectedYear('');
                    setRemarks('');
                    setFile(null);
                  }}>
                    Clear Form
                  </Button>
                  <Button type="submit" disabled={isUploading} className="order-1 sm:order-2">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
