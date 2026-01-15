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
