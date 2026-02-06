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
    <div className={cn('stat-card-mobile', variantStyles[variant])}>
      <div className="flex items-center gap-3 sm:gap-4 w-full">
        {/* Icon - hidden on mobile, visible on tablet+ */}
        <div className={cn(
          'hidden sm:flex w-14 h-14 rounded-xl items-center justify-center shrink-0 transition-transform hover:scale-105',
          iconContainerStyles[variant]
        )}>
          {icon}
        </div>

        {/* Content section - full width on mobile */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-xs sm:text-sm font-medium mb-1',
            variant === 'default' ? 'text-muted-foreground' : 'text-white/80'
          )}>
            {title}
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-none">{value}</p>
            {trend && (
              <span className={cn(
                'text-xs font-semibold px-1.5 py-0.5 rounded',
                trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
                variant !== 'default' && 'bg-white/20 text-white'
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subtitle at bottom, full width */}
      {subtitle && (
        <div className="w-full mt-2 pt-2 border-t border-current/10">
          <p className={cn(
            'text-xs leading-tight',
            variant === 'default' ? 'text-muted-foreground' : 'text-white/70'
          )}>
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
}
