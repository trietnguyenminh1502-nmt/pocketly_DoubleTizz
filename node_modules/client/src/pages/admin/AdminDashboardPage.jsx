import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Skeleton,
  useToast
} from '../../components/ui';
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
  Tooltip
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
    { name: 'Người dùng hoạt động', count: stats?.users?.active || 0, fill: '#123D2F' },
    { name: 'Người dùng bị khóa', count: stats?.users?.locked || 0, fill: '#FF8A7A' },
    { name: 'Đăng ký tuần qua', count: stats?.users?.newThisWeek || 0, fill: '#FF6A2B' },
    { name: 'Có giao dịch tháng qua', count: stats?.users?.transactingPast30Days || 0, fill: '#D4F05A' }
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
          Trung Tâm Quản Trị Hệ Thống 🛡️
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
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
          <Card className="flex flex-col justify-between p-5">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng người dùng</span>
              <div className="p-2 rounded-full bg-sand/40 text-primary dark:text-lime">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
              {stats?.users?.total || 0}
            </div>
            <p className="text-[11px] text-primary dark:text-lime mt-1 font-semibold">
              +{stats?.users?.newThisWeek || 0} sinh viên đăng ký tuần qua
            </p>
          </Card>

          <Card className="flex flex-col justify-between p-5">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Người dùng Active</span>
              <div className="p-2 rounded-full bg-mint/50 text-primary">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-heading text-primary dark:text-lime">
              {stats?.users?.active || 0}
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              Đang hoạt động bình thường trên hệ thống
            </p>
          </Card>

          <Card className="flex flex-col justify-between p-5">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng giao dịch</span>
              <div className="p-2 rounded-full bg-tangerine/15 text-tangerine">
                <ReceiptText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-heading text-tangerine">
              {stats?.transactions?.total || 0}
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              {stats?.users?.transactingPast30Days || 0} user có phát sinh chi tiêu gần đây
            </p>
          </Card>

          <Card className="flex flex-col justify-between p-5">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Lượt hỏi AI Chatbot</span>
              <div className="p-2 rounded-full bg-lime/20 text-lime-dark">
                <Bot className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
              {stats?.chatbot?.totalMessages || 0}
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              Qua {stats?.chatbot?.totalSessions || 0} phiên tư vấn tài chính
            </p>
          </Card>
        </div>
      )}

      {/* 3. Chart & System Announcement Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ phân bổ người dùng */}
        <Card className="lg:col-span-7 flex flex-col p-6">
          <CardHeader
            title="Phân Bổ Người Dùng & Hoạt Động"
            subtitle="Tỷ lệ người dùng kích hoạt, bị khóa và mức độ tương tác"
          />
          {isLoading ? (
            <Skeleton className="h-64 my-auto" />
          ) : (
            <div className="h-64 w-full my-auto pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E2D6" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5C6B64' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#5C6B64' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E8E2D6' }} />
                  <Bar dataKey="count" name="Số lượng" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

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
