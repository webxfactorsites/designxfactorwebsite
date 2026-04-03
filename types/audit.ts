export type AuditCourseType =
  | 'higher-education'
  | 'corporate-training'
  | 'healthcare'
  | 'government'
  | 'k12'
  | '';

export interface AuditContact {
  name: string;
  email: string;
  company: string;
  role: string;
  courseType: AuditCourseType;
}

export interface AuditUpload {
  file: File | null;
  fileName: string;
}

export interface AuditState {
  step: 'landing' | 'contact' | 'upload' | 'submitted';
  contact: AuditContact;
  upload: AuditUpload;
  jobId: string | null;
  submitting: boolean;
  error: string | null;
}
