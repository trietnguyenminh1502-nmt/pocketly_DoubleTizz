import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/api/finance';
import {
  Card,
  CardHeader,
  Button,
  Money,
  Select,
  Skeleton,
  EmptyState,
  useToast
} from '@/components/ui';
import {
  FileSpreadsheet,
  TrendingUp,
  Calendar,
  PieChart as PieIcon,
  BarChart2,
  ArrowUpRight,
  ArrowDownLeft,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ReportsPage = () => {
  const { addToast } = useToast();
  const now = new Date();

  const [periodTab, setPeriodTab] = useState('monthly'); // monthly, yearly
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // 1. Fetch dữ liệu Thống kê Báo cáo
  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ['reportSummary'],
    queryFn: () => reportApi.getSummary()
  });

  const { data: categorySpendingRes, isLoading: loadingCategory } = useQuery({
    queryKey: ['categorySpending', { month: selectedMonth, year: selectedYear }],
    queryFn: () => reportApi.getSpendingByCategory({ month: selectedMonth, year: selectedYear })
  });

  const { data: trendsRes, isLoading: loadingTrends } = useQuery({
    queryKey: ['trends', { months: periodTab === 'yearly' ? 12 : 6 }],
    queryFn: () => reportApi.getTrends({ months: periodTab === 'yearly' ? 12 : 6 })
  });

  const { data: topCategoriesRes, isLoading: loadingTop } = useQuery({
    queryKey: ['topCategories', { month: selectedMonth, year: selectedYear }],
    queryFn: () => reportApi.getTopCategories({ limit: 5, month: selectedMonth, year: selectedYear })
  });

  const summary = summaryRes?.data;
  const categoryData = categorySpendingRes?.data?.categories || [];
  const trendsData = trendsRes?.data?.trends || [];
  const topCategories = topCategoriesRes?.data?.topCategories || [];

  // Export Báo cáo Excel
  const handleExportReportExcel = async () => {
    try {
      addToast({ message: 'Đang khởi tạo tệp báo cáo tài chính Excel...', type: 'info' });
      const res = await reportApi.exportReportExcel({ month: selectedMonth, year: selectedYear });

      const blob = new Blob([res], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pocketly-financial-report-T${selectedMonth}-${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addToast({ message: 'Xuất báo cáo Excel thành công! 🌿', type: 'success' });
    } catch {
      addToast({ message: 'Không thể xuất tệp báo cáo', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
            Báo Cáo & Phân Tích 📈
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Báo cáo trực quan tình hình chi tiêu, so sánh tháng và xuất dữ liệu sang Excel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportReportExcel}
          >
            Xuất Báo Cáo Excel
          </Button>

          {/* Tab Theo Tháng / Theo Năm */}
          <div className="flex p-1 rounded-full bg-border-light/40 dark:bg-surface-dark border border-border-light dark:border-border-dark">
            <button
              onClick={() => setPeriodTab('monthly')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                periodTab === 'monthly'
                  ? 'bg-primary text-white dark:bg-lime dark:text-ink-light shadow-soft'
                  : 'text-ink-muted'
              }`}
            >
              6 Tháng
            </button>
            <button
              onClick={() => setPeriodTab('yearly')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                periodTab === 'yearly'
                  ? 'bg-primary text-white dark:bg-lime dark:text-ink-light shadow-soft'
                  : 'text-ink-muted'
              }`}
            >
              12 Tháng
            </button>
          </div>
        </div>
      </div>

      {/* 2. Month-over-Month Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between p-5">
          <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Tổng thu nhập tháng</span>
          <div className="mt-2">
            <Money amount={summary?.currentMonth?.income || 0} type="income" showSign className="text-2xl font-extrabold" />
          </div>
          <p className="text-[11px] text-ink-muted mt-2">
            Tháng trước: {Number(summary?.momComparison?.lastMonthIncome || 0).toLocaleString('vi-VN')}₫
          </p>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Tổng chi tiêu tháng</span>
          <div className="mt-2">
            <Money amount={summary?.currentMonth?.expense || 0} type="expense" showSign className="text-2xl font-extrabold" />
          </div>
          <p className="text-[11px] text-ink-muted mt-2">
            Tháng trước: {Number(summary?.momComparison?.lastMonthExpense || 0).toLocaleString('vi-VN')}₫
          </p>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Tiền tiết kiệm ròng</span>
          <div className="mt-2">
            <Money
              amount={summary?.currentMonth?.netSavings || 0}
              type={summary?.currentMonth?.netSavings >= 0 ? 'income' : 'expense'}
              showSign
              className="text-2xl font-extrabold"
            />
          </div>
          <p className="text-[11px] text-ink-muted mt-2">
            Dư sau khi trừ chi phí sinh hoạt
          </p>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Tỷ lệ tiết kiệm (%)</span>
          <div className="mt-2 text-2xl font-extrabold font-heading text-primary dark:text-lime">
            {summary?.currentMonth?.savingsRate}%
          </div>
          <p className="text-[11px] text-ink-muted mt-2">
            Mục tiêu khuyến nghị sinh viên: ≥ 20%
          </p>
        </Card>
      </div>

      {/* 3. Trends & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ Cột Xu hướng */}
        <Card className="lg:col-span-8 flex flex-col p-6">
          <CardHeader
            title={`Biểu Đồ Xu Hướng (${periodTab === 'yearly' ? '12 Tháng' : '6 Tháng'})`}
            subtitle="Tương quan giữa dòng tiền vào và dòng tiền ra"
          />
          {loadingTrends ? (
            <Skeleton className="h-72 my-auto" />
          ) : (
            <div className="h-72 w-full my-auto pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E2D6" opacity={0.5} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5C6B64' }} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#5C6B64' }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(val) => `${Number(val).toLocaleString('vi-VN')}₫`}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #E8E2D6' }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
                  <Bar dataKey="income" name="Thu nhập" fill="#123D2F" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Chi tiêu" fill="#FF8A7A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Top 5 Danh Mục Tốn Kém Nhất */}
        <Card className="lg:col-span-4 flex flex-col p-6">
          <CardHeader
            title="Top 5 Chi Phí Lớn Nhất"
            subtitle={`Chiếm tỷ trọng cao nhất trong tháng ${selectedMonth}`}
          />
          {loadingTop ? (
            <div className="space-y-3 my-auto">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : topCategories.length === 0 ? (
            <EmptyState title="Chưa có dữ liệu" className="my-auto py-8" />
          ) : (
            <div className="space-y-4 my-auto">
              {topCategories.map((c, index) => (
                <div key={c.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {index + 1}. {c.name}
                    </span>
                    <strong className="text-tangerine">
                      {Number(c.amount).toLocaleString('vi-VN')}₫ ({c.percentage}%)
                    </strong>
                  </div>
                  <div className="w-full bg-border-light/60 dark:bg-border-dark rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
