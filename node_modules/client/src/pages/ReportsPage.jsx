import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/api/finance';
import { cn } from '@/utils/cn';
import {
  Card,
  Button,
  Money,
  Select,
  Skeleton,
  EmptyState,
  useToast,
  ProgressBar,
  StatCard,
  ChartCard,
  ChartTooltip
} from '@/components/ui';
import { formatCompactVND, formatPercent } from '../../../shared/formatters.js';
import { chartTheme, getCategoryColorInfo } from '@/utils/chartTheme';
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
  const topCategories = rawTop.map((cat, index) => ({
    ...cat,
    colorInfo: getCategoryColorInfo(cat, index)
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
        <StatCard
          label="Tổng thu nhập tháng"
          labelClassName="text-xs uppercase font-bold tracking-wider"
          value={summary?.currentMonth?.income || 0}
          valueType="income"
          showSign
          valueClassName="font-extrabold"
          comparisonClassName="text-[11px]"
          className="p-5"
          comparison={(
            <>
              Tháng trước:{' '}
              <Money
                amount={summary?.momComparison?.lastMonthIncome || 0}
                type="neutral"
                className="text-secondary font-normal"
              />
            </>
          )}
        />
        <StatCard
          label="Tổng chi tiêu tháng"
          labelClassName="text-xs uppercase font-bold tracking-wider"
          value={summary?.currentMonth?.expense || 0}
          valueType="expense"
          showSign
          valueClassName="font-extrabold"
          comparisonClassName="text-[11px]"
          className="p-5"
          comparison={(
            <>
              Tháng trước:{' '}
              <Money
                amount={summary?.momComparison?.lastMonthExpense || 0}
                type="neutral"
                className="text-secondary font-normal"
              />
            </>
          )}
        />
        <StatCard
          label="Tiền tiết kiệm ròng"
          labelClassName="text-xs uppercase font-bold tracking-wider"
          value={summary?.currentMonth?.netSavings || 0}
          valueType={summary?.currentMonth?.netSavings >= 0 ? 'income' : 'expense'}
          showSign
          valueClassName="font-extrabold"
          comparisonClassName="text-[11px]"
          className="p-5"
          comparison="Dư sau khi trừ chi phí sinh hoạt"
        />
        <StatCard
          label="Tỷ lệ tiết kiệm (%)"
          labelClassName="text-xs uppercase font-bold tracking-wider"
          value={summary?.currentMonth?.savingsRate ?? 0}
          valueFormatter={formatPercent}
          valueClassName="font-extrabold font-heading text-brand dark:text-lime"
          comparisonClassName="text-[11px]"
          className="p-5"
          comparison="Mục tiêu khuyến nghị sinh viên: ≥ 20%"
        />
      </div>

      {/* 3. Trends & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ Cột Xu hướng */}
        <ChartCard
          className="lg:col-span-8 flex flex-col p-6"
          chartClassName="flex flex-col flex-1"
          title={
            fromMonth === toMonth
              ? `Biểu Đồ Xu Hướng (Tháng ${fromMonth}/${selectedYear})`
              : `Biểu Đồ Xu Hướng (Tháng ${fromMonth} - ${toMonth}/${selectedYear})`
          }
          description="Tương quan giữa dòng tiền vào và dòng tiền ra"
        >
          {loadingTrends ? (
            <Skeleton className="h-72 my-auto" />
          ) : (
            <div className="h-72 w-full my-auto pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid {...chartTheme.grid} />
                  <XAxis
                    dataKey="label"
                    tick={chartTheme.axis.xTick}
                    tickLine={chartTheme.axis.tickLine}
                    axisLine={chartTheme.axis.axisLine}
                  />
                  <YAxis
                    tick={chartTheme.axis.yTick}
                    tickFormatter={formatCompactVND}
                    tickLine={chartTheme.axis.tickLine}
                    axisLine={chartTheme.axis.axisLine}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={chartTheme.legend.wrapperStyle}
                  />
                  <Bar dataKey="income" name="Thu nhập" fill={chartTheme.colors.primary} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Chi tiêu" fill={chartTheme.colors.expense} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Top 5 Danh Mục Tốn Kém Nhất */}
        <ChartCard
          className="lg:col-span-4 flex flex-col p-6"
          chartClassName="flex flex-col flex-1"
          title="Top 5 Chi Phí Lớn Nhất"
          description={
            fromMonth === toMonth
              ? `Chiếm tỷ trọng cao nhất trong Tháng ${fromMonth}/${selectedYear}`
              : `Chiếm tỷ trọng cao nhất từ Tháng ${fromMonth} - ${toMonth}/${selectedYear}`
          }
        >
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
              {topCategories.map((category, index) => (
                <div key={category.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${category.colorInfo.className}`}
                        style={category.colorInfo.hasCustomColor
                          ? { backgroundColor: category.colorInfo.color }
                          : undefined}
                      />
                      {index + 1}. {category.name}
                    </span>
                    <strong className="text-tangerine">
                      <Money amount={category.amount} type="expense" className="text-tangerine font-extrabold" /> ({formatPercent(category.percentage ?? 0)})
                    </strong>
                  </div>
                  <ProgressBar
                    progress={category.percentage}
                    color="safe"
                    trackClassName="h-2"
                    barClassName={category.colorInfo.className}
                    barStyle={category.colorInfo.hasCustomColor
                      ? { backgroundColor: category.colorInfo.color }
                      : undefined}
                    label={`Tỷ trọng chi tiêu ${category.name}`}
                  />
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};
