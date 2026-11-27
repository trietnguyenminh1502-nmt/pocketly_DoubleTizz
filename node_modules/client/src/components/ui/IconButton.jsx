import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const actionIcons = {
  edit: Pencil,
  delete: Trash2
};

const defaultLabels = {
  edit: 'Sửa',
  delete: 'Xóa'
};

export const IconButton = ({
  variant = 'edit',
  icon: Icon,
  'aria-label': ariaLabel,
  title,
  className = '',
  type = 'button',
  ...props
}) => {
  const normalizedVariant = actionIcons[variant] ? variant : 'edit';
  const ActionIcon = Icon || actionIcons[normalizedVariant];
  const accessibleLabel = ariaLabel || defaultLabels[normalizedVariant];

  return (
    <button
      {...props}
      type={type}
      aria-label={accessibleLabel}
      title={title || accessibleLabel}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-2 transition-all focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:focus-visible:opacity-100',
        normalizedVariant === 'delete'
          ? 'text-danger hover:bg-danger-soft'
          : 'text-secondary hover:bg-primary/10 hover:text-primary',
        className
      )}
    >
      <ActionIcon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
};
