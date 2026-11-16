import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';

// Mock AuthContext
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null
  })
}));

// Mock Toast
const mockAddToast = vi.fn();
vi.mock('../components/ui', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useToast: () => ({
      addToast: mockAddToast
    })
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearMocks();
  });

  it('renders login form with inputs and submit button', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/địa chỉ email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
  });

  it('updates form inputs when typed into', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/địa chỉ email/i);
    const passwordInput = screen.getByLabelText(/mật khẩu/i);

    fireEvent.change(emailInput, { target: { value: 'student@pocketly.vn' } });
    fireEvent.change(passwordInput, { target: { value: 'Student@123' } });

    expect(emailInput.value).toBe('student@pocketly.vn');
    expect(passwordInput.value).toBe('Student@123');
  });

  it('calls login function upon form submission', async () => {
    mockLogin.mockResolvedValueOnce({
      id: '123',
      fullName: 'Nguyễn Văn A',
      email: 'student@pocketly.vn',
      role: 'USER'
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/địa chỉ email/i);
    const passwordInput = screen.getByLabelText(/mật khẩu/i);
    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

    fireEvent.change(emailInput, { target: { value: 'student@pocketly.vn' } });
    fireEvent.change(passwordInput, { target: { value: 'Student@123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'student@pocketly.vn',
        password: 'Student@123'
      });
    });
  });

  it('displays error message when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Mật khẩu không chính xác'));

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /đăng nhập/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Mật khẩu không chính xác')).toBeInTheDocument();
    });
  });
});
