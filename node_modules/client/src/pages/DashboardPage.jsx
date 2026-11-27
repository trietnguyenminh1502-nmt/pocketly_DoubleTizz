import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi, budgetApi, savingGoalApi, transactionApi, categoryApi, walletApi } from '@/api/finance';
import {
  Card,
  CardHeader,
  Money,
  Button,
  ProgressBar,
  Badge,
  Skeleton,
  EmptyState,
  StatCard,
  ChartCard,
  ChartTooltip
} from '@/components/ui';
import { TransactionFormModal } from '@/components/finance/TransactionFormModal';
import { formatCompactVND, formatDate, formatPercent } from '../../../shared/formatters.js';
import { chartTheme, getCategoryColorInfo } from '@/utils/chartTheme';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  PiggyBank,
  Target,
  Clock,
  ChevronRight,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // 1. Fetch dữ liệu tài chính
  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ['reportSummary'],
    queryFn: () => reportApi.getSummary()
  });

  const { data: categorySpendingRes, isLoading: loadingCategory } = useQuery({
    queryKey: ['categorySpending'],
    queryFn: () => reportApi.getSpendingByCategory()
  });

  const { data: trendsRes, isLoading: loadingTrends } = useQuery({
    queryKey: ['trends'],
    queryFn: () => reportApi.getTrends({ months: 6 })
  });

  const { data: budgetsRes, isLoading: loadingBudgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetApi.list()
  });

  const { data: savingGoalsRes, isLoading: loadingGoals } = useQuery({
    queryKey: ['savingGoals'],
    queryFn: () => savingGoalApi.list()
  });

  const { data: recentTxsRes, isLoading: loadingRecentTxs } = useQuery({
    queryKey: ['transactions', { limit: 5 }],
    queryFn: () => transactionApi.list({ limit: 5, page: 1 })
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list()
  });

  const { data: walletsRes } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletApi.list()
  });

  const summary = summaryRes?.data;
  const rawCategories = categorySpendingRes?.data?.categories || [];
  const categoryData = rawCategories.map((cat, index) => ({
    ...cat,
    colorInfo: getCategoryColorInfo(cat, index)
  }));
  const trendsData = trendsRes?.data?.trends || [];
  const budgets = budgetsRes?.data?.budgets || [];
  const savingGoals = savingGoalsRes?.data?.goals || [];
  const recentTransactions = recentTxsRes?.data?.transactions || [];

  const categories = categoriesRes?.data?.categories || [];
  const wallets = walletsRes?.data?.wallets || [];

  return (
    <div className="space-y-8">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Tổng quan tài chính 🌿
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Theo dõi dòng tiền, ngân sách và mục tiêu tiết kiệm thông minh
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/chat">
            <Button variant="lime" size="sm" icon={Bot}>
              Hỏi Pocketly AI
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            className="font-semibold text-sm"
            onClick={() => setIsQuickAddOpen(true)}
          >
            Thêm giao dịch
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      {loadingSummary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tổng số dư khả dụng"
            labelClassName="text-xs font-bold uppercase tracking-wider"
            value={summary?.totalBalance || 0}
            icon={Wallet}
            iconClassName="bg-sand/40 text-brand dark:text-lime"
            valueClassName="font-extrabold font-heading"
            comparison="Tổng từ tất cả ví cá nhân"
          />
          <StatCard
            label="Thu nhập tháng"
            labelClassName="text-xs font-bold uppercase tracking-wider"
            value={summary?.currentMonth?.income || 0}
            valueType="income"
            showSign
            icon={ArrowDownLeft}
            iconClassName="bg-mint/50 text-brand"
            valueClassName="font-extrabold font-heading"
            trend={(summary?.momComparison?.incomeGrowthPercentage ?? 0) >= 0 ? 'up' : 'down'}
            comparison={(
              <>
                Tăng trưởng:{' '}
                <strong className="text-brand dark:text-lime">
                  {formatPercent(summary?.momComparison?.incomeGrowthPercentage ?? 0)}
                </strong>{' '}
                so với tháng trước
              </>
            )}
          />
          <StatCard
            label="Chi tiêu tháng"
            labelClassName="text-xs font-bold uppercase tracking-wider"
            value={summary?.currentMonth?.expense || 0}
            valueType="expense"
            showSign
            icon={ArrowUpRight}
            iconClassName="bg-tangerine/15 text-tangerine"
            valueClassName="font-extrabold font-heading"
            trend={(summary?.momComparison?.expenseGrowthPercentage ?? 0) >= 0 ? 'down' : 'up'}
            comparison={(
              <>
                Biến động:{' '}
                <strong className="text-tangerine">
                  {formatPercent(summary?.momComparison?.expenseGrowthPercentage ?? 0)}
                </strong>{' '}
                so với tháng trước
              </>
            )}
          />
          <StatCard
            label="Tiết kiệm ròng"
            labelClassName="text-xs font-bold uppercase tracking-wider"
            value={summary?.currentMonth?.netSavings || 0}
            valueType={summary?.currentMonth?.netSavings >= 0 ? 'income' : 'expense'}
            showSign
            icon={TrendingUp}
            iconClassName="bg-lime/20 text-lime-dark"
            valueClassName="font-extrabold font-heading"
            comparison={(
              <>
                Tỷ lệ tiết kiệm:{' '}
                <strong className="text-brand dark:text-lime">
                  {formatPercent(summary?.currentMonth?.savingsRate ?? 0)}
                </strong>
              </>
            )}
          />
        </div>
      )}

      {/* 3. Charts Row: Donut Chart & Trends Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Cơ cấu chi tiêu theo danh mục */}
        <ChartCard
          className="lg:col-span-5 flex flex-col p-6 sm:p-7"
          chartClassName="flex flex-col flex-1"
          title="Cơ Cấu Chi Tiêu Tháng Này"
          description="Phân bổ tiền theo các danh mục ăn uống, học tập..."
        >
          {loadingCategory ? (
            <Skeleton className="h-64 my-auto" />
          ) : categoryData.length === 0 ? (
            <EmptyState title="Chưa có chi tiêu tháng này" description="Hãy ghi nhận các khoản chi để hiển thị biểu đồ" className="my-auto py-8" />
          ) : (
            <div className="flex flex-col flex-1 justify-between space-y-6">
              <div className="h-60 sm:h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={98}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.colorInfo.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="pt-4 border-t border-border/60">
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  {categoryData.slice(0, 4).map((cat, idx) => {
                    const color = cat.colorInfo || getCategoryColorInfo(cat, idx);
                    return (
                      <div key={cat.categoryId || idx} className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.className}`}
                          style={color.hasCustomColor ? { backgroundColor: color.color } : undefined}
                        />
                        <span className="truncate text-secondary text-xs sm:text-sm">{cat.name}:</span>
                        <strong className="text-primary text-xs sm:text-sm font-bold shrink-0">
                          {formatPercent(cat.percentage ?? 0)}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </ChartCard>

        {/* Bar Chart: Thu Nhập vs Chi Tiêu (6 tháng) */}
        <ChartCard
          className="lg:col-span-7 flex flex-col"
          chartClassName="flex flex-col flex-1"
          title="Xu Hướng Thu - Chi 6 Tháng"
          description="So sánh tổng thu nhập và chi phí sinh hoạt qua từng tháng"
        >
          {loadingTrends ? (
            <Skeleton className="h-64 my-auto" />
          ) : trendsData.length === 0 ? (
            <EmptyState title="Chưa đủ dữ liệu biểu đồ" className="my-auto py-8" />
          ) : (
            <div className="h-64 w-full my-auto pt-2">
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
      </div>

      {/* 4. Bottom Row: Budgets, Goals, Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Budgets & Saving Goals Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Ngân Sách Tháng Này */}
          <Card>
            <CardHeader
              title="Tiến Độ Ngân Sách Tháng"
              subtitle="Cảnh báo khi chi tiêu vượt hạn mức an toàn"
              action={
                <Link to="/budgets" className="text-xs font-bold text-brand dark:text-lime hover:underline flex items-center">
                  Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            {loadingBudgets ? (
              <div className="space-y-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : budgets.length === 0 ? (
              <EmptyState title="Chưa tạo ngân sách tháng" description="Thiết lập ngân sách để kiểm soát chi tiêu tốt hơn!" className="py-6" />
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 3).map((b) => (
                  <div key={b.id} className="space-y-1.5 p-3 rounded-16 bg-sand/20 dark:bg-white/5 border border-border/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary">
                        {b.category?.name || 'Ngân sách tổng toàn tháng'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="tabular-nums font-semibold">
                          <Money amount={b.spent} type="neutral" className="font-semibold" /> / <Money amount={b.limit} type="neutral" className="font-semibold" />
                        </span>
                        <Badge
                          variant={b.status === 'EXCEEDED' ? 'coral' : b.status === 'WARNING' ? 'tangerine' : 'primary'}
                        >
                          {formatPercent(b.percentage ?? 0)}
                        </Badge>
                      </div>
                    </div>
                    <ProgressBar
                      progress={b.percentage}
                      color={b.status === 'EXCEEDED' ? 'coral' : b.status === 'WARNING' ? 'tangerine' : 'primary'}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Mục Tiêu Tiết Kiệm */}
          <Card>
            <CardHeader
              title="Mục Tiêu Tiết Kiệm"
              subtitle="Tích lũy cho các dự định lớn của sinh viên"
              action={
                <Link to="/goals" className="text-xs font-bold text-brand dark:text-lime hover:underline flex items-center">
                  Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            {loadingGoals ? (
              <div className="space-y-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : savingGoals.length === 0 ? (
              <EmptyState title="Chưa có mục tiêu tiết kiệm" description="Đặt mục tiêu mua laptop, du lịch hè ngay!" className="py-6" />
            ) : (
              <div className="space-y-4">
                {savingGoals.slice(0, 2).map((g) => (
                  <div key={g.id} className="space-y-1.5 p-3 rounded-16 bg-sand/20 dark:bg-white/5 border border-border/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary truncate max-w-[200px]">
                        {g.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="tabular-nums font-semibold">
                          <Money amount={g.currentAmount} type="neutral" className="font-semibold" /> / <Money amount={g.targetAmount} type="neutral" className="font-semibold" />
                        </span>
                        <Badge variant="lime">{formatPercent(g.progress ?? 0)}</Badge>
                      </div>
                    </div>
                    <ProgressBar progress={g.progress} color="lime" />
                    {g.projectedCompletionDate && (
                      <p className="text-[10px] text-secondary flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3 text-tangerine" />
                        Dự kiến hoàn thành: <strong>{g.projectedCompletionDate}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Transactions Column */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col">
            <CardHeader
              title="Giao Dịch Gần Đây"
              subtitle="5 khoản chi tiêu/thu nhập mới nhất"
              action={
                <Link to="/transactions" className="text-xs font-bold text-brand dark:text-lime hover:underline flex items-center">
                  Tất cả giao dịch <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            {loadingRecentTxs ? (
              <div className="space-y-3 flex-1">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : recentTransactions.length === 0 ? (
              <EmptyState title="Chưa có giao dịch" description="Bấm 'Thêm giao dịch' để bắt đầu ghi chép" className="my-auto py-8" />
            ) : (
              <div className="divide-y divide-border-light/60 dark:divide-border-dark/60 flex-1">
                {recentTransactions.map((tx) => {
                  const color = getCategoryColorInfo(tx.category);
                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-soft ${color.softClassName} ${color.textClassName}`}
                          style={color.hasCustomColor
                            ? { backgroundColor: `${color.color}20`, color: color.color }
                            : undefined}
                        >
                          {tx.type === 'INCOME' ? '+' : '-'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-primary truncate">
                            {tx.note || tx.category?.name || 'Giao dịch'}
                          </p>
                          <p className="text-[11px] text-secondary">
                            {formatDate(tx.date)} • {tx.wallet?.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <Money
                          amount={Number(tx.amount)}
                          type={tx.type === 'INCOME' ? 'income' : 'expense'}
                          showSign
                          className="text-sm font-bold"
                        />
                        <span className="block text-[10px] text-secondary uppercase">{tx.category?.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Add Modal */}
      <TransactionFormModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categories}
        wallets={wallets}
      />
    </div>
  );
};
