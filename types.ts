// ============ EXISTING TYPES ============

export enum LayerType {
  FOUNDATION = 'FOUNDATION',
  ENGAGEMENT = 'ENGAGEMENT',
  MULTIMODAL = 'MULTIMODAL',
  EMPOWERMENT = 'EMPOWERMENT'
}

export interface ProductData {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export interface LayerContent {
  id: number;
  type: LayerType;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  hex: string;
}

// Simplified navigation - focused on core training message
export type PageView = 'home' | 'how-we-work' | 'terms' | 'privacy' | 'thank-you' | 'course-audit';

export interface NavProps {
  onNavigate: (page: PageView) => void;
  currentPage: PageView;
}

// ============ NEW AUDIT TOOL TYPES ============

export enum InstitutionType {
  PUBLIC_UNIVERSITY = 'Public University',
  COMMUNITY_COLLEGE = 'Community College',
  PRIVATE_INSTITUTION = 'Private Institution',
  K12_DISTRICT = 'K-12 District'
}

export interface AuditFormData {
  institutionType: InstitutionType;
  enrollment: number;
  email: string;
}

export interface ComplianceIssue {
  severity: 'high' | 'medium' | 'low';
  issue: string;
  description: string;
}

export interface FileAnalysisResult {
  fileName: string;
  estimatedPages: number;
  isCompliant: boolean;
  issues: ComplianceIssue[];
  summary: string;
}

export interface FinancialImpact {
  totalPages: number;
  estimatedCourses: number;
  manualRemediationCost: number;
  manualTimeHours: number;
  aiTransformationCost: number;
  aiTimeHours: number;
  potentialFine: number;
  defenseCost: number;
  savings: number;
  savingsPercentage: number;
}

export interface AuditReport {
  analysis: FileAnalysisResult;
  financials: FinancialImpact;
  formData: AuditFormData;
  file?: File;
}