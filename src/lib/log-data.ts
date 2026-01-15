
export type LogEntry = {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  source: 'admin' | 'user' | 'system' | 'api';
  message: string;
  metadata?: {
    ip?: string;
    userId?: string;
    courseId?: string;
  };
};

// This is mock data that simulates real log entries.
// In a real application, this data would come from a logging service or database.
export const logData: LogEntry[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    severity: 'critical',
    source: 'system',
    message: 'Failed to connect to payment gateway: Connection timed out.',
    metadata: { ip: '192.168.1.1' },
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    severity: 'warning',
    source: 'user',
    message: 'User login failed: Invalid credentials.',
    metadata: { userId: 'user-xyz', ip: '103.22.45.1' },
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    severity: 'info',
    source: 'admin',
    message: 'Admin avik911 updated course "Start Hacking From Zero 2.0".',
    metadata: { userId: 'admin-123', courseId: 'cyber-10' },
  },
   {
    id: 'log-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    severity: 'info',
    source: 'user',
    message: 'User successfully logged in.',
    metadata: { userId: 'user-abc', ip: '201.55.78.9' },
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    severity: 'warning',
    source: 'api',
    message: 'API rate limit exceeded for key "prod-key-123".',
    metadata: { ip: '55.66.77.88' },
  },
  {
    id: 'log-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    severity: 'info',
    source: 'system',
    message: 'Database backup completed successfully.',
  },
  {
    id: 'log-007',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    severity: 'warning',
    source: 'user',
    message: 'User password reset requested.',
    metadata: { userId: 'user-def', ip: '111.22.33.4' },
  },
   {
    id: 'log-008',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    severity: 'critical',
    source: 'system',
    message: 'Unauthorized access attempt detected from a blacklisted IP.',
    metadata: { ip: '99.88.77.66' },
  },
  {
    id: 'log-009',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    severity: 'info',
    source: 'user',
    message: 'User purchased course "Bug Hunting A–Z".',
    metadata: { userId: 'user-abc', courseId: 'cyber-8' },
  },
  {
    id: 'log-010',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    severity: 'info',
    source: 'admin',
    message: 'Admin avik911 logged in successfully.',
    metadata: { userId: 'admin-123', ip: '192.168.1.1' },
  },
  {
    id: 'log-011',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    severity: 'warning',
    source: 'system',
    message: 'Disk space on primary server is low (85% used).',
  },
  {
    id: 'log-012',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    severity: 'info',
    source: 'system',
    message: 'System health check: All services are operational.',
  },
];
