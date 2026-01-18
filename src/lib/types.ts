
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
  category: string;
  imageId: string;
  imageUrl?: string;
  lessons: { id: string; title: string; duration: string }[];
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  learningOutcomes?: string[];
  prerequisites?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  hasPreview?: boolean;
  enrollmentCount?: number;
  status?: 'draft' | 'published' | 'unpublished';
  downloadUrl?: string;
  downloadPassword?: string;
  certificateSettings?: {
    countdownDays?: number;
    quizEnabled?: boolean;
  };
};

export type LogEntry = {
  id: string;
  timestamp: any; // Firestore Timestamp
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
    id: string;
    userId: string;
    courseId: string;
    studentName: string;
    courseName: string;
    courseLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
    issueDate: Timestamp;
    certificateCode: string;
    status: 'valid' | 'revoked';
    certificateUrl?: string;
    qrCodeUrl?: string;
};
