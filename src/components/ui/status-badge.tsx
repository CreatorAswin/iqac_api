import { cn } from '@/lib/utils';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

type Status = 'pending' | 'approved' | 'rejected';

interface StatusBadgeProps {
  status: Status;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'status-pending',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    className: 'status-approved',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    className: 'status-rejected',
    icon: XCircle,
  },
};

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn('status-badge', config.className, className)}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </span>
  );
}
