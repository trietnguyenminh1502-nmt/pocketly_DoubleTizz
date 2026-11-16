import React from 'react';
import { cn } from '@/utils/cn';

export const Table = ({ children, className = '' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-16 border border-border-light dark:border-border-dark">
      <table className={cn('w-full text-left text-sm border-collapse', className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '' }) => {
  return (
    <thead
      className={cn(
        'bg-sand/40 dark:bg-surface-dark border-b border-border-light dark:border-border-dark text-xs uppercase font-bold text-ink-muted dark:text-ink-dark/70 tracking-wider',
        className
      )}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '' }) => {
  return (
    <tbody className={cn('divide-y divide-border-light/60 dark:divide-border-dark/60 bg-surface-light dark:bg-surface-dark', className)}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-sand/20 dark:hover:bg-white/5',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th className={cn('px-4 py-3.5 font-bold', className)} {...props}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={cn('px-4 py-3.5 text-ink-light dark:text-ink-dark', className)} {...props}>
      {children}
    </td>
  );
};
