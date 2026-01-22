
import type { Timestamp } from 'firebase/firestore';

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: Timestamp;
  completionPercentage: number;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: string;
  courseType?: 'Free' | 'Paid';
  discountPrice?: string;
  category: string;
  imageId: string; // Legacy, prefer imageUrl
  imageUrl?: string;
  lessons: { id: string; title: string; duration: string }[];
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  language?: string;
  tags?: string[];
  learningOutcomes?: string[];
  prerequisites?: string;
  totalModules?: number;
  totalLessons?: number;
  estimatedDuration?: string;
  courseFormat?: 'Recorded' | 'Live' | 'Mixed';
  downloadableResources?: string[];
  accessValidity?: 'Lifetime' | string;
  isNew?: boolean;
  isBestseller?: boolean;
  hasPreview?: boolean;
  enrollmentCount?: number;
  status?: 'draft' | 'published' | 'unpublished';
  visibility?: 'public' | 'private' | 'hidden';
  downloadUrl?: string;
  downloadPassword?: string;
  certificateSettings?: {
    quizEnabled?: boolean;
    quizRequired?: boolean;
    countdownDays?: number;
  };
};

export type LogEntry = {
  id: string;
  timestamp: Timestamp;
  severity: 'info' | 'warning' | 'critical';
  source: 'admin' | 'user' | 'system' | 'api';
  message: string;
  metadata?: {
    userId?: string;
    courseId?: string;
    paymentId?: string;
    route?: string;
    ip?: string;
    error?: string;
  };
};

export type SocialLink = {
    id: 'github' | 'telegram' | 'instagram';
    name: string;
    url: string;
    visible: boolean;
};

export interface SiteSettings {
  id: 'global';
  siteName: string;
  tagline: string;
  description: string;
  footerText: string;
  logoUrl: string;
  faviconUrl: string;
  maintenanceMode: boolean;
  enableGoogleLogin: boolean;
  enableEmailLogin: boolean;
  disablePurchases: boolean;
  upiId: string;
  receiverName: string;
  currencySymbol: string;
  paymentInstructions: string;
  qrCodeUrl: string;
  socialLinks: SocialLink[];
}

export type Certificate = {
    id: string; // The doc ID in the user's subcollection (usually courseId)
    userId: string;
    courseId: string;
    studentName: string;
    courseName: string;
    courseLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
    issueDate: Timestamp;
    certificateCode: string; // The unique code, and the ID for the public collection
    status: 'valid' | 'revoked';
    creationMethod?: 'auto' | 'manual';
};

export type SecurityMetrics = {
    activeSecurityEvents: number;
    failedLoginAttempts: number;
    adminActions: number;
    highRiskIpCount: number;
};

export type SecurityAlert = {
    caseId: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    explanation: string;
    confidence: number;
    relatedLogIds: string[];
};
