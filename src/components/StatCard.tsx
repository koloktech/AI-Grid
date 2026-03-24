import React from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
  valueClassName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, className, valueClassName }) => {
  return (
    <div className={clsx("bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className="text-zinc-500">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={clsx("text-3xl font-semibold text-white font-mono", valueClassName)}>{value}</span>
        {trend && <span className="text-sm text-emerald-400">{trend}</span>}
      </div>
    </div>
  );
};
