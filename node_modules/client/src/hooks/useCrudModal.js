import { useState } from 'react';

const resolveInitialFormData = (initialFormData) => {
  const values = typeof initialFormData === 'function' ? initialFormData() : initialFormData;
  return { ...(values || {}) };
};

export const useCrudModal = ({
  initialFormData = {},
  mapRecordToForm = (record) => record
} = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('create');
  const [record, setRecord] = useState(null);
  const [formData, setFormData] = useState(() => resolveInitialFormData(initialFormData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  const openCreate = (overrides = {}) => {
    setMode('create');
    setRecord(null);
    setFormData({ ...resolveInitialFormData(initialFormData), ...overrides });
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setMode('edit');
    setRecord(item);
    setFormData({
      ...resolveInitialFormData(initialFormData),
      ...(mapRecordToForm(item) || {})
    });
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setMode('create');
    setRecord(null);
    setFormData(resolveInitialFormData(initialFormData));
  };

  const setField = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const submit = async (handler) => {
    setIsSubmitting(true);
    try {
      return await handler(formData, record, mode);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (target) => {
    setDeleteTarget(target);
    setIsDeleteConfirmationOpen(true);
  };

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false);
    setDeleteTarget(null);
  };

  return {
    isOpen,
    mode,
    record,
    formData,
    setFormData,
    setField,
    isSubmitting,
    submit,
    openCreate,
    openEdit,
    close,
    deleteTarget,
    isDeleteConfirmationOpen,
    requestDelete,
    cancelDelete
  };
};
