import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<Props> = ({ label, value, icon, color = 'text-indigo-600' }) => (
  <Card className="bg-white border border-slate-100 flex-1 min-w-0">
    <CardContent className="p-4 flex items-center gap-3">
      {icon && (
        <div className={cn('p-2 rounded-lg bg-slate-50', color)}>
          {icon}
        </div>
      )}
      <div>
        <div className={cn('text-2xl font-bold', color)}>{value.toLocaleString()}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </CardContent>
  </Card>
);

export default StatCard;
