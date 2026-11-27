import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Skeleton,
  useToast,
  StatCard,
  ChartCard,
  ChartTooltip
} from '@/components/ui';
import { chartTheme, formatChartCount } from '@/utils/chartTheme';
import {
  Users,
  ReceiptText,
  Bot,
  UserCheck,
  UserX,
  Send,
  Sparkles,
  TrendingUp,
  Megaphone
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    type: 'SYSTEM'
  });

  // 1. Fetch Thống kê Dashboard Quản trị
  const { data: statsRes, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminApi.getDashboardStats()
  });

  const stats = statsRes?.data;

  // 2. Mutation Phát sóng thông báo hệ thống
  const broadcastMutation = useMutation({
    mutationFn: (data) => adminApi.broadcastNotification(data),
    onSuccess: () => {
      addToast({
        message: 'Đã phát sóng thông báo đến toàn bộ người dùng hệ thống! 📢',
        type: 'success'
      });
      setBroadcastData({ title: '', message: '', type: 'SYSTEM' });
      queryClient.invalidateQueries({ queryKey: ['adminAuditLogs'] });
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi gửi thông báo', type: 'error' });
    }
  });

  const chartData = [
    { name: 'Người dùng hoạt động', count: stats?.users?.active || 0, fill: chartTheme.colors.primary },
    { name: 'Người dùng bị khóa', count: stats?.users?.locked || 0, fill: chartTheme.colors.danger },
    { name: 'Đăng ký tuần qua', count: stats?.users?.newThisWeek || 0, fill: chartTheme.colors.warning },
    { name: 'Có giao dịch tháng qua', count: stats?.users?.transactingPast30Days || 0, fill: chartTheme.colors.accent }
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
          Trung Tâm Quản Trị Hệ Thống 🛡️
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Giám sát tình hình hoạt động, tăng trưởng người dùng và thông báo toàn hệ thống
        </p>
      </div>

      {/* 2. Top Metric Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tổng người dùng"
            labelClassName="text-xs font-bold uppercase tracking-wider"
            value={stats?.users?.total || 0}
            valueFormatter={formatChartCount}
            valueClassName="text-3xl font-extrabold font-heading text-primary"
            icon={Users}
            iconClassName="bg-sand/40 text-brand dark:text-lime"
            trend={(stats?.users?.newThisWeek || 0) > 0 ? 'up' : 'neutral'}
            comparison={`+${formatChartCount(stats?.users?.newThisWeek || 0)} sinh viên đăng ký tuần qua`}
            comparisonClassName="text-[11px] font-semibold"
            className="p-5"
          />
          <StatCard
            label="Người dùng Active"
            labelClassName="text-xs font-bold uppercase tracking-wider"
            value={stats?.users?.active || 0}
            valueFormatter={formatChartCount}
            valueClassName="text-3xl font-extrabold font-heading text-brand dark:text-lime"
            icon={UserCheck}
            iconClassName="bg-mint/50 text-brand"
            comparison="Đang hoạt động bình thường trên hệ thống"
            comparisonClassName="text-[11px]"
            className="p-5"
          />
          <StatCard
            label="Tổng giao dịch"
            labelClassName="text-xs font-bold uppercase tracking-wider"
            value={stats?.transactions?.total || 0}
            valueFormatter={formatChartCount}
            valueClassName="text-3xl font-extrabold font-heading text-tangerine"
            icon={ReceiptText}
            iconClassName="bg-tangerine/15 text-tangerine"
            comparison={`${formatChartCount(stats?.users?.transactingPast30Days || 0)} user có phát sinh chi tiêu gần đây`}
            comparisonClassName="text-[11px]"
            className="p-5"
          />
          <StatCard
            label="Lượt hỏi AI Chatbot"
            labelClassName="text-xs font-bold uppercase tracking-wider"
            value={stats?.chatbot?.totalMessages || 0}
            valueFormatter={formatChartCount}
            valueClassName="text-3xl font-extrabold font-heading text-primary"
            icon={Bot}
            iconClassName="bg-lime/20 text-lime-dark"
            comparison={`Qua ${formatChartCount(stats?.chatbot?.totalSessions || 0)} phiên tư vấn tài chính`}
            comparisonClassName="text-[11px]"
            className="p-5"
          />
        </div>
      )}

      {/* 3. Chart & System Announcement Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ phân bổ người dùng */}
        <ChartCard
          className="lg:col-span-7 flex flex-col p-6"
          chartClassName="flex flex-col flex-1"
          title="Phân Bổ Người Dùng & Hoạt Động"
          description="Tỷ lệ người dùng kích hoạt, bị khóa và mức độ tương tác"
        >
          {isLoading ? (
            <Skeleton className="h-64 my-auto" />
          ) : (
            <div className="h-64 w-full my-auto pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid {...chartTheme.grid} />
                  <XAxis
                    dataKey="name"
                    tick={chartTheme.axis.yTick}
                    tickLine={chartTheme.axis.tickLine}
                    axisLine={chartTheme.axis.axisLine}
                  />
                  <YAxis
                    tick={chartTheme.axis.yTick}
                    tickLine={chartTheme.axis.tickLine}
                    axisLine={chartTheme.axis.axisLine}
                  />
                  <Tooltip content={<ChartTooltip valueFormatter={formatChartCount} />} />
                  <Bar dataKey="count" name="Số lượng" radius={[8, 8, 0, 0]}>
                    {chartData.map((item) => (
                      <Cell key={item.name} fill={item.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Form Phát Sóng Thông Báo Hệ Thống */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <CardHeader
              title="Phát Sóng Thông Báo 📢"
              subtitle="Gửi thông báo tới toàn thể người dùng Pocketly"
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                broadcastMutation.mutate(broadcastData);
              }}
              className="space-y-3.5"
            >
              <Input
                label="Tiêu đề thông báo (*)"
                placeholder="VD: Cập nhật tính năng mới / Lịch bảo trì..."
                value={broadcastData.title}
                onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                required
              />

              <Select
                label="Loại thông báo"
                value={broadcastData.type}
                onChange={(e) => setBroadcastData({ ...broadcastData, type: e.target.value })}
              >
                <option value="SYSTEM">Hệ thống (SYSTEM)</option>
                <option value="INFO">Thông tin (INFO)</option>
                <option value="WARNING">Cảnh báo bảo trì (WARNING)</option>
              </Select>

              <Textarea
                label="Nội dung thông báo (*)"
                placeholder="Nhập nội dung chi tiết gửi tới toàn thể người dùng..."
                rows={3}
                value={broadcastData.message}
                onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                className="w-full mt-2"
                isLoading={broadcastMutation.isPending}
              >
                Phát sóng ngay
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};
