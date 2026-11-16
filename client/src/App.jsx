import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Guards
import { ProtectedRoute, AdminRoute } from './routes/GuardRoutes';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { NotFoundPage, ForbiddenPage, LegalPage } from './pages/StaticPages';
import { DesignPreviewPage } from './pages/DesignPreviewPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { WalletsPage } from './pages/WalletsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SavingGoalsPage } from './pages/SavingGoalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DashboardPlaceholder, AdminPlaceholder } from './pages/Placeholders';

// Khởi tạo React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5 // 5 phút
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/terms" element={<LegalPage type="terms" />} />
                  <Route path="/privacy" element={<LegalPage type="privacy" />} />
                  <Route path="/design-preview" element={<DesignPreviewPage />} />
                </Route>

                {/* 2. Auth Split-screen Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                {/* 3. Protected User App Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/wallets" element={<WalletsPage />} />
                    <Route path="/budgets" element={<BudgetsPage />} />
                    <Route path="/goals" element={<SavingGoalsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/chat" element={<DashboardPlaceholder />} />
                    <Route path="/notifications" element={<DashboardPlaceholder />} />
                    <Route path="/profile" element={<DashboardPlaceholder />} />
                  </Route>
                </Route>

                {/* 4. Protected Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminPlaceholder />} />
                    <Route path="/admin/*" element={<AdminPlaceholder />} />
                  </Route>
                </Route>

                {/* 5. Error & Fallback Routes */}
                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
