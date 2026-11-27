import React from 'react';
import { cn } from '@/utils/cn';
import { Button } from './Button';
import { Modal } from './Modal';

export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Lưu',
  cancelText = 'Hủy',
  isSubmitting = false,
  maxWidth = 'max-w-md',
  className = ''
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
      <form onSubmit={onSubmit} className={cn('space-y-4', className)}>
        {children}
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
