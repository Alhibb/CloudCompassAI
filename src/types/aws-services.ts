export type ServiceCategory = 'compute' | 'storage' | 'database' | 'networking';

export interface AWSService {
  id: string;
  name: string;
  category: ServiceCategory;
  icon: string;
  color: string;
}

export const AWS_SERVICES: AWSService[] = [
  {
    id: 'ec2',
    name: 'EC2',
    category: 'compute',
    icon: 'Server',
    color: '#06b6d4', // cyan
  },
  {
    id: 'lambda',
    name: 'Lambda',
    category: 'compute',
    icon: 'Zap',
    color: '#06b6d4', // cyan
  },
  {
    id: 's3',
    name: 'S3',
    category: 'storage',
    icon: 'Database',
    color: '#10b981', // emerald
  },
  {
    id: 'dynamodb',
    name: 'DynamoDB',
    category: 'database',
    icon: 'Table',
    color: '#8b5cf6', // violet
  },
  {
    id: 'rds',
    name: 'RDS',
    category: 'database',
    icon: 'HardDrive',
    color: '#8b5cf6', // violet
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    category: 'networking',
    icon: 'Network',
    color: '#d946ef', // fuchsia
  },
];

export const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  compute: '#06b6d4',
  storage: '#10b981',
  database: '#8b5cf6',
  networking: '#d946ef',
};
