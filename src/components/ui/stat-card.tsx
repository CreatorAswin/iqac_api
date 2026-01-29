import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-card border',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-white',
  danger: 'bg-rose-500 text-white',
};

const iconContainerStyles = {
  default: 'bg-primary/10 text-primary',
  primary: 'bg-white/20 text-white',
  success: 'bg-white/20 text-white',
  warning: 'bg-white/20 text-white',
  danger: 'bg-white/20 text-white',
};

export function StatCard({ title, value, subtitle, icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn('stat-card', variantStyles[variant])}>
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', iconContainerStyles[variant])}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={cn(
          'text-sm font-medium',
          variant === 'default' ? 'text-muted-foreground' : 'text-white/80'
        )}>
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <span className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-emerald-500' : 'text-rose-500',
              variant !== 'default' && 'text-white/80'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className={cn(
            'text-xs mt-1',
            variant === 'default' ? 'text-muted-foreground' : 'text-white/70'
          )}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
