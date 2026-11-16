import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { TransactionFormModal } from '@/components/finance/TransactionFormModal';

const mockCategories = [
  { id: 'cat-1', name: 'Ăn uống', type: 'EXPENSE', icon: 'Utensils', color: '#FF6A2B' },
  { id: 'cat-2', name: 'Lương làm thêm', type: 'INCOME', icon: 'Briefcase', color: '#D4F05A' }
];

const mockWallets = [
  { id: 'wal-1', name: 'Ví Tiền Mặt', balance: 500000 },
  { id: 'wal-2', name: 'Tài khoản MB Bank', balance: 2500000 }
];

const renderComponent = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TransactionFormModal
          isOpen={true}
          onClose={vi.fn()}
          categories={mockCategories}
          wallets={mockWallets}
          {...props}
        />
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('TransactionForm Component', () => {
  it('renders form fields: type tabs, amount, category, wallet, date, note', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /khoản chi tiêu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /khoản thu nhập/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/số tiền/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/danh mục/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ví thanh toán/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ngày giao dịch/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lưu giao dịch/i })).toBeInTheDocument();
  });

  it('switches between Expense and Income tabs', () => {
    renderComponent();

    const expenseTab = screen.getByRole('button', { name: /khoản chi tiêu/i });
    const incomeTab = screen.getByRole('button', { name: /khoản thu nhập/i });

    expect(expenseTab).toHaveClass('bg-tangerine');

    fireEvent.click(incomeTab);
    expect(incomeTab).toHaveClass('bg-primary');
  });

  it('validates that amount must be positive', async () => {
    renderComponent();

    const amountInput = screen.getByLabelText(/số tiền/i);
    const submitBtn = screen.getByRole('button', { name: /lưu giao dịch/i });

    fireEvent.change(amountInput, { target: { value: '-1000' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/số tiền phải lớn hơn 0/i)).toBeInTheDocument();
    });
  });

  it('fills inputs when initialData is provided for edit mode', () => {
    const initialData = {
      id: 'tx-123',
      type: 'EXPENSE',
      amount: 45000,
      categoryId: 'cat-1',
      walletId: 'wal-1',
      date: '2026-11-16T08:00:00.000Z',
      note: 'Trà sữa trân châu'
    };

    renderComponent({ initialData });

    expect(screen.getByText(/chỉnh sửa giao dịch/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/số tiền/i).value).toBe('45000');
    expect(screen.getByLabelText(/ghi chú/i).value).toBe('Trà sữa trân châu');
    expect(screen.getByRole('button', { name: /lưu thay đổi/i })).toBeInTheDocument();
  });
});
