import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  CardHeader,
  Badge,
  Modal,
  ConfirmDialog,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  Skeleton,
  EmptyState,
  Pagination,
  ProgressBar,
  Avatar,
  DatePicker,
  Dropdown,
  Money,
  ThemeToggle,
  useToast
} from '@/components/ui';
import { formatPercent } from '../../../shared/formatters.js';
import {
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  Trash2,
  Share2,
  Check,
  Plus
} from 'lucide-react';

export const DesignPreviewPage = () => {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [date, setDate] = useState('2026-11-16');

  const demoTabs = [
    { id: 'overview', label: 'Tổng quan', icon: Sparkles },
    { id: 'transactions', label: 'Giao dịch', icon: ArrowUpRight },
    { id: 'settings', label: 'Cài đặt', icon: Settings }
  ];

  const dropdownItems = [
    { label: 'Chia sẻ ví', icon: Share2, onClick: () => addToast({ message: 'Đã copy link chia sẻ!', type: 'info' }) },
    { label: 'Cài đặt ví', icon: Settings, onClick: () => setIsModalOpen(true) },
    { label: 'Xóa ví này', icon: Trash2, danger: true, onClick: () => setIsConfirmOpen(true) }
  ];

  return (
    <div className="min-h-screen bg-background text-primary transition-colors p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Showcase */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🌿</span>
              <h1 className="text-3xl font-extrabold font-heading text-brand dark:text-lime">
                Pocketly Design System
              </h1>
            </div>
            <p className="text-sm text-secondary">
              Hệ thống UI Component hoàn chỉnh theo phong cách Gen-Z Fintech Editorial (Light & Dark Mode)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => addToast({ message: 'Chào mừng bạn đến với Pocketly! 🌿', type: 'success' })}
            >
              Test Toast
            </Button>
          </div>
        </header>

        {/* 1. Money Component Showcase */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-heading">1. Định dạng Tiền tệ (Money Component)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <span className="text-xs text-secondary block mb-1">Tổng Số Dư Khả Dụng</span>
              <Money amount={12450000} type="neutral" className="text-2xl" />
            </Card>
            <Card>
              <span className="text-xs text-secondary block mb-1">Thu Nhập Tháng (Income)</span>
              <Money amount={4500000} type="income" showSign className="text-2xl" />
            </Card>
            <Card>
              <span className="text-xs text-secondary block mb-1">Chi Tiêu Tháng (Expense)</span>
              <Money amount={2150000} type="expense" showSign className="text-2xl" />
            </Card>
          </div>
        </section>

        {/* 2. Buttons & Badges */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-heading">2. Buttons (Pill Shapes) & Badges</h2>
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="lime">Lime Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" isLoading>Loading</Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              <Badge variant="primary">Primary Mint</Badge>
              <Badge variant="tangerine">Tangerine</Badge>
              <Badge variant="lime">Lime Accent</Badge>
              <Badge variant="coral">Expense Coral</Badge>
              <Badge variant="sand">Sand Neutral</Badge>
              <Badge variant="neutral">Default Border</Badge>
            </div>
          </Card>
        </section>

        {/* 3. Form Controls & Inputs */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-heading">3. Form Controls & Dropdown</h2>
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Input label="Họ và tên" placeholder="VD: Nguyễn Minh Trí" />
              <Input label="Số tiền giao dịch" placeholder="50.000" icon={Wallet} />
              <DatePicker label="Chọn ngày" value={date} onChange={setDate} />
              <Select
                label="Chọn loại ví"
                options={[
                  { value: 'cash', label: 'Tiền mặt' },
                  { value: 'momo', label: 'Ví MoMo' },
                  { value: 'bank', label: 'Tài khoản MB Bank' }
                ]}
              />
              <Input label="Input Báo Lỗi" value="abc" error="Định dạng số không hợp lệ" readOnly />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-secondary">Dropdown Menu</label>
                <div>
                  <Dropdown
                    trigger={
                      <Button variant="outline" size="sm">
                        Mở Menu Thao Tác ▾
                      </Button>
                    }
                    items={dropdownItems}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Textarea label="Ghi chú chi tiêu" placeholder="Nhập mô tả chi tiết..." />
            </div>
          </Card>
        </section>

        {/* 4. Tabs, Progress & Avatar */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-heading">4. Tabs, Progress & Avatar</h2>
          <Card className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Tabs tabs={demoTabs} activeTab={activeTab} onChange={setActiveTab} />
              <div className="flex items-center gap-3">
                <Avatar fallback="NT" size="sm" />
                <Avatar fallback="PT" size="md" />
                <Avatar fallback="AD" size="lg" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Tiến độ tiết kiệm mua Laptop ({formatPercent(65)})</span>
                <strong>
                  <Money amount={11700000} type="neutral" /> / <Money amount={18000000} type="neutral" />
                </strong>
              </div>
              <ProgressBar progress={65} color="primary" />
            </div>
          </Card>
        </section>

        {/* 5. Table & Pagination */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-heading">5. Table & Pagination</h2>
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Mục chi tiêu</TableHead>
                  <TableHead>Ví</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead className="text-right">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>16/11/2026</TableCell>
                  <TableCell className="font-bold">Cơm trưa căn tin</TableCell>
                  <TableCell>Tiền mặt</TableCell>
                  <TableCell><Money amount={35000} type="expense" showSign /></TableCell>
                  <TableCell className="text-right"><Badge variant="coral">Chi tiêu</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>15/11/2026</TableCell>
                  <TableCell className="font-bold">Lương trợ giảng</TableCell>
                  <TableCell>MB Bank</TableCell>
                  <TableCell><Money amount={2400000} type="income" showSign /></TableCell>
                  <TableCell className="text-right"><Badge variant="primary">Thu nhập</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="p-4 border-t border-border">
              <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
            </div>
          </Card>
        </section>

        {/* 6. Modals, Empty State & Skeleton */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-heading">6. Modals, Skeletons & Empty State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex flex-col justify-between">
              <div>
                <CardHeader title="Modal & Confirm Dialog" subtitle="Kiểm tra mở hộp thoại xác nhận" />
                <p className="text-sm text-secondary mb-4">
                  Bấm các nút dưới đây để kiểm tra hiệu ứng Pop-up và backdrop mờ:
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                  Mở Modal
                </Button>
                <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                  Mở Confirm Dialog
                </Button>
              </div>
            </Card>

            <EmptyState
              title="Chưa có thông báo mới"
              description="Hộp thư của bạn đang hoàn toàn trống trải. Hệ thống sẽ báo khi có cập nhật mới!"
              action={<Button variant="outline" size="sm">Làm mới</Button>}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </section>
      </div>

      {/* Demo Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Chỉnh Sửa Thông Tin">
        <div className="space-y-4">
          <Input label="Tên ví hiển thị" defaultValue="Ví Tiền Mặt" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" size="sm" onClick={() => { setIsModalOpen(false); addToast({ message: 'Đã lưu thay đổi!', type: 'success' }); }}>Lưu lại</Button>
          </div>
        </div>
      </Modal>

      {/* Demo Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          addToast({ message: 'Đã thực hiện xóa thành công', type: 'error' });
        }}
        title="Xóa ví tiền"
        message="Hành động này sẽ xóa vĩnh viễn ví đã chọn và không thể hoàn tác. Bạn có chắc chắn không?"
        confirmText="Xóa vĩnh viễn"
        isDanger
      />
    </div>
  );
};
