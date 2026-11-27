import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/api/finance';
import { cn } from '@/utils/cn';
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
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const CATEGORY_COLOR_MAP = {
  'Tiền thuê trọ': '#3B82F6',
  'Mua sắm cá nhân': '#8B5CF6',
  'Ăn uống': '#F97316',
  'Di chuyển': '#06B6D4',
  'Học tập & Giáo trình': '#10B981',
  'Giải trí & Phim ảnh': '#F59E0B',
  'Sức khỏe & Y tế': '#EC4899',
  'Du Lịch': '#14B8A6'
};

const DISTINCT_COLORS = [
  '#3B82F6', '#8B5CF6', '#F97316', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#14B8A6', '#6366F1'
];

export const ReportsPage = () => {
  const { addToast } = useToast();
  const now = new Date();

  // Bộ lọc: Năm và Khoảng tháng (Mặc định 6 tháng gần nhất: Tháng 6 -> Tháng 11/2026)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [fromMonth, setFromMonth] = useState(Math.max(1, now.getMonth() - 4)); // T6
  const [toMonth, setToMonth] = useState(now.getMonth() + 1); // T11

  // 1. Fetch dữ liệu Thống kê Báo cáo
  const { data: summaryRes } = useQuery({
    queryKey: ['reportSummary'],
    queryFn: () => reportApi.getSummary()
  });

  const { data: categorySpendingRes, isLoading: loadingCategory } = useQuery({
    queryKey: ['categorySpending', { year: selectedYear, fromMonth, toMonth }],
    queryFn: () => reportApi.getSpendingByCategory({ year: selectedYear, fromMonth, toMonth })
  });

  const { data: trendsRes, isLoading: loadingTrends } = useQuery({
    queryKey: ['trends', { year: selectedYear, fromMonth, toMonth }],
    queryFn: () => reportApi.getTrends({ year: selectedYear, fromMonth, toMonth })
  });

  const { data: topCategoriesRes, isLoading: loadingTop } = useQuery({
    queryKey: ['topCategories', { year: selectedYear, fromMonth, toMonth }],
    queryFn: () => reportApi.getTopCategories({ limit: 5, year: selectedYear, fromMonth, toMonth })
  });

  const summary = summaryRes?.data;
  const trendsData = trendsRes?.data?.trends || [];
  const rawTop = topCategoriesRes?.data?.topCategories || [];
  const topCategories = rawTop.map((cat, idx) => ({
    ...cat,
    color: CATEGORY_COLOR_MAP[cat.name] || cat.color || DISTINCT_COLORS[idx % DISTINCT_COLORS.length]
  }));

  // Export Báo cáo Excel theo khoảng thời gian đã lọc
  const handleExportReportExcel = async () => {
    try {
      addToast({
        message: `Đang khởi tạo tệp báo cáo tài chính T${fromMonth}-T${toMonth}/${selectedYear}...`,
        type: 'info'
      });
      const res = await reportApi.exportReportExcel({
        year: selectedYear,
        fromMonth,
        toMonth
      });

      const blob = new Blob([res], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pocketly-report-T${fromMonth}-T${toMonth}-${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addToast({ message: 'Xuất báo cáo Excel thành công! 🌿', type: 'success' });
    } catch {
      addToast({ message: 'Không thể xuất tệp báo cáo', type: 'error' });
    }
  };

  const setQuarter = (start, end) => {
    setFromMonth(start);
    setToMonth(end);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Bộ lọc thời gian linh hoạt */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Báo Cáo & Phân Tích 📈
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Báo cáo chi tiết theo năm, theo quý hoặc khoảng tháng tuỳ chọn và xuất file Excel
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={FileSpreadsheet}
          onClick={handleExportReportExcel}
          className="self-start md:self-auto shrink-0 font-semibold"
        >
          Xuất Báo Cáo Excel
        </Button>
      </div>

      {/* Filter Bar: Chọn Năm, Từ tháng, Đến tháng & Chọn nhanh theo Quý */}
      <Card className="p-4 bg-surface border-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Lọc Năm */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand dark:text-lime" />
              <span className="text-xs font-bold text-secondary">Năm:</span>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                containerClassName="w-24"
                className="py-1.5 text-xs font-bold"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </div>

            {/* Lọc Khoảng Tháng (Từ tháng ... đến tháng ...) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-secondary">Từ:</span>
              <Select
                value={fromMonth}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFromMonth(val);
                  if (val > toMonth) setToMonth(val);
                }}
                containerClassName="w-28"
                className="py-1.5 text-xs"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </Select>

              <span className="text-xs font-bold text-secondary">đến:</span>
              <Select
                value={toMonth}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setToMonth(val);
                  if (val < fromMonth) setFromMonth(val);
                }}
                containerClassName="w-28"
                className="py-1.5 text-xs"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Chọn nhanh theo Quý (3 tháng) và Cả năm */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-border-light/40 dark:bg-surface-dark border border-border overflow-x-auto">
            <button
              onClick={() => setQuarter(1, 3)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                fromMonth === 1 && toMonth === 3
                  ? 'bg-primary text-white dark:bg-lime dark:text-ink-light shadow-soft'
                  : 'text-secondary hover:text-ink-light dark:hover:text-ink-dark'
              )}
            >
              Quý 1 (T1-3)
            </button>
            <button
              onClick={() => setQuarter(4, 6)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                fromMonth === 4 && toMonth === 6
                  ? 'bg-primary text-white dark:bg-lime dark:text-ink-light shadow-soft'
                  : 'text-secondary hover:text-ink-light dark:hover:text-ink-dark'
              )}
            >
              Quý 2 (T4-6)
            </button>
            <button
              onClick={() => setQuarter(7, 9)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                fromMonth === 7 && toMonth === 9
                  ? 'bg-primary text-white dark:bg-lime dark:text-ink-light shadow-soft'
                  : 'text-secondary hover:text-ink-light dark:hover:text-ink-dark'
              )}
            >
              Quý 3 (T7-9)
            </button>
            <button
              onClick={() => setQuarter(10, 12)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                fromMonth === 10 && toMonth === 12
                  ? 'bg-primary text-white dark:bg-lime dark:text-ink-light shadow-soft'
                  : 'text-secondary hover:text-ink-light dark:hover:text-ink-dark'
              )}
            >
              Quý 4 (T10-12)
            </button>
            <button
              onClick={() => setQuarter(1, 12)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                fromMonth === 1 && toMonth === 12
                  ? 'bg-primary text-white dark:bg-lime dark:text-ink-light shadow-soft'
                  : 'text-secondary hover:text-ink-light dark:hover:text-ink-dark'
              )}
            >
              Cả năm
            </button>
          </div>
        </div>
      </Card>

      {/* 2. Month-over-Month Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between p-5">
          <span className="text-xs text-secondary uppercase font-bold tracking-wider">Tổng thu nhập tháng</span>
          <div className="mt-2">
            <Money amount={summary?.currentMonth?.income || 0} type="income" showSign className="text-2xl font-extrabold" />
          </div>
          <p className="text-[11px] text-secondary mt-2">
            Tháng trước: {Number(summary?.momComparison?.lastMonthIncome || 0).toLocaleString('vi-VN')}₫
          </p>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <span className="text-xs text-secondary uppercase font-bold tracking-wider">Tổng chi tiêu tháng</span>
          <div className="mt-2">
            <Money amount={summary?.currentMonth?.expense || 0} type="expense" showSign className="text-2xl font-extrabold" />
          </div>
          <p className="text-[11px] text-secondary mt-2">
            Tháng trước: {Number(summary?.momComparison?.lastMonthExpense || 0).toLocaleString('vi-VN')}₫
          </p>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <span className="text-xs text-secondary uppercase font-bold tracking-wider">Tiền tiết kiệm ròng</span>
          <div className="mt-2">
            <Money
              amount={summary?.currentMonth?.netSavings || 0}
              type={summary?.currentMonth?.netSavings >= 0 ? 'income' : 'expense'}
              showSign
              className="text-2xl font-extrabold"
            />
          </div>
          <p className="text-[11px] text-secondary mt-2">
            Dư sau khi trừ chi phí sinh hoạt
          </p>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <span className="text-xs text-secondary uppercase font-bold tracking-wider">Tỷ lệ tiết kiệm (%)</span>
          <div className="mt-2 text-2xl font-extrabold font-heading text-brand dark:text-lime">
            {summary?.currentMonth?.savingsRate}%
          </div>
          <p className="text-[11px] text-secondary mt-2">
            Mục tiêu khuyến nghị sinh viên: ≥ 20%
          </p>
        </Card>
      </div>

      {/* 3. Trends & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ Cột Xu hướng */}
        <Card className="lg:col-span-8 flex flex-col p-6">
          <CardHeader
            title={
              fromMonth === toMonth
                ? `Biểu Đồ Xu Hướng (Tháng ${fromMonth}/${selectedYear})`
                : `Biểu Đồ Xu Hướng (Tháng ${fromMonth} - ${toMonth}/${selectedYear})`
            }
            subtitle="Tương quan giữa dòng tiền vào và dòng tiền ra"
          />
          {loadingTrends ? (
            <Skeleton className="h-72 my-auto" />
          ) : (
            <div className="h-72 w-full my-auto pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--color-chart-border))" opacity={0.5} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgb(var(--color-chart-secondary))' }} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'rgb(var(--color-chart-secondary))' }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(val) => `${Number(val).toLocaleString('vi-VN')}₫`}
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgb(var(--color-chart-border))' }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
                  <Bar dataKey="income" name="Thu nhập" fill="rgb(var(--color-chart-primary))" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Chi tiêu" fill="rgb(var(--color-chart-expense))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Top 5 Danh Mục Tốn Kém Nhất */}
        <Card className="lg:col-span-4 flex flex-col p-6">
          <CardHeader
            title="Top 5 Chi Phí Lớn Nhất"
            subtitle={
              fromMonth === toMonth
                ? `Chiếm tỷ trọng cao nhất trong Tháng ${fromMonth}/${selectedYear}`
                : `Chiếm tỷ trọng cao nhất từ Tháng ${fromMonth} - ${toMonth}/${selectedYear}`
            }
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
                  <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden">
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
