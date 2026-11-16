import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders button with label', () => {
    render(<Button>Lưu giao dịch</Button>);
    expect(screen.getByRole('button', { name: /lưu giao dịch/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Bấm vào đây</Button>);

    fireEvent.click(screen.getByRole('button', { name: /bấm vào đây/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Vô hiệu hóa</Button>);

    const button = screen.getByRole('button', { name: /vô hiệu hóa/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders spinner and disables button when isLoading is true', () => {
    render(<Button isLoading>Đang xử lý</Button>);

    const button = screen.getByRole('button', { name: /đang xử lý/i });
    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('applies custom variant classes correctly', () => {
    const { rerender } = render(<Button variant="danger">Xóa dữ liệu</Button>);
    expect(screen.getByRole('button', { name: /xóa dữ liệu/i })).toHaveClass('bg-coral');

    rerender(<Button variant="lime">Tạo mới</Button>);
    expect(screen.getByRole('button', { name: /tạo mới/i })).toHaveClass('bg-lime');
  });
});
