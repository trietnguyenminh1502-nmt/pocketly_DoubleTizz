import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { userApi } from '@/api/chatNotificationUser';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Avatar,
  Modal,
  ConfirmDialog,
  useToast
} from '@/components/ui';
import {
  User,
  Lock,
  Camera,
  Moon,
  Sun,
  Coins,
  Trash2,
  Save,
  ShieldAlert
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUserState, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State Cập nhật Profile
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    currency: user?.currency || 'VND'
  });

  // Form State Đổi Mật Khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // 1. Mutation Cập nhật Profile
  const updateProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: (res) => {
      updateUserState(res.data.user);
      addToast({ message: 'Cập nhật thông tin cá nhân thành công! 🌿', type: 'success' });
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi cập nhật thông tin', type: 'error' });
    }
  });

  // 2. Mutation Upload Avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return userApi.updateAvatar(formData);
    },
    onSuccess: (res) => {
      updateUserState({ avatarUrl: res.data.user.avatarUrl });
      addToast({ message: 'Cập nhật ảnh đại diện thành công!', type: 'success' });
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi tải ảnh đại diện', type: 'error' });
    }
  });

  // 3. Mutation Đổi Mật Khẩu
  const changePasswordMutation = useMutation({
    mutationFn: (data) => userApi.changePassword(data),
    onSuccess: () => {
      addToast({ message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => logout(), 1500);
    },
    onError: (err) => {
      addToast({ message: err.message || 'Lỗi khi đổi mật khẩu', type: 'error' });
    }
  });

  // 4. Mutation Xóa Tài Khoản
  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      addToast({ message: 'Tài khoản của bạn đã được xóa hoàn toàn.', type: 'info' });
      logout();
    },
    onError: (err) => {
      addToast({ message: err.message || 'Không thể xóa tài khoản', type: 'error' });
    }
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        addToast({ message: 'Kích thước file ảnh tối đa là 3MB', type: 'error' });
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      addToast({ message: 'Mật khẩu xác nhận không trùng khớp!', type: 'error' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      addToast({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự!', type: 'error' });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-ink-light dark:text-ink-dark">
          Hồ Sơ & Cài Đặt Cá Nhân ⚙️
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Quản lý tài khoản, thay đổi ảnh đại diện, mật khẩu và tùy chọn giao diện
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Account Info Card */}
        <Card className="md:col-span-5 flex flex-col items-center text-center p-6 space-y-4">
          <div className="relative group">
            <Avatar
              src={user?.avatarUrl ? `http://localhost:5000${user.avatarUrl}` : null}
              fallback={user?.fullName?.charAt(0) || 'U'}
              size="lg"
              className="w-24 h-24 text-2xl border-2 border-primary/20 dark:border-lime/30"
            />
            <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white dark:bg-lime dark:text-ink-light cursor-pointer shadow-soft hover:scale-105 active:scale-95 transition-all">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploadAvatarMutation.isPending}
              />
            </label>
          </div>

          <div>
            <h3 className="text-lg font-bold text-ink-light dark:text-ink-dark">{user?.fullName}</h3>
            <p className="text-xs text-ink-muted mt-0.5">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand/60 dark:bg-surface-dark text-xs font-bold text-primary dark:text-lime">
              Vai trò: {user?.role === 'ADMIN' ? 'Quản trị viên (ADMIN)' : 'Sinh viên (USER)'}
            </div>
          </div>

          <div className="w-full pt-4 border-t border-border-light/60 dark:border-border-dark/60 text-left space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Tùy chọn giao diện</span>
            <div className="flex items-center justify-between p-3 rounded-20 bg-sand/20 dark:bg-white/5 border border-border-light/60 dark:border-border-dark/60">
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-lime" /> : <Sun className="w-4 h-4 text-primary" />}
                <span>Chế độ: {theme === 'dark' ? 'Tối (Dark)' : 'Sáng (Light)'}</span>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="text-xs py-1 px-3">
                Chuyển đổi
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Column: Forms */}
        <div className="md:col-span-7 space-y-6">
          {/* Form 1: Cập nhật Thông Tin Cá Nhân & Tiền tệ */}
          <Card className="p-6">
            <CardHeader
              title="Thông Tin Tài Khoản"
              subtitle="Cập nhật họ tên hiển thị và loại tiền tệ mặc định"
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProfileMutation.mutate(profileData);
              }}
              className="space-y-4"
            >
              <Input
                label="Họ và tên sinh viên (*)"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                required
              />

              <Input
                label="Địa chỉ Email"
                value={user?.email || ''}
                readOnly
                disabled
                helperText="Email không thể thay đổi để đảm bảo tính xác thực của tài khoản"
              />

              <Select
                label="Đơn vị tiền tệ chính"
                value={profileData.currency}
                onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
              >
                <option value="VND">VND (Việt Nam Đồng - ₫)</option>
                <option value="USD">USD (Đô la Mỹ - $)</option>
              </Select>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={Save}
                  isLoading={updateProfileMutation.isPending}
                >
                  Lưu thông tin
                </Button>
              </div>
            </form>
          </Card>

          {/* Form 2: Đổi Mật Khẩu */}
          <Card className="p-6">
            <CardHeader
              title="Đổi Mật Khẩu"
              subtitle="Nên đặt mật khẩu từ 6 ký tự trở lên kèm chữ hoa và số"
            />
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Mật khẩu hiện tại (*)"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />

              <Input
                label="Mật khẩu mới (*)"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                icon={Lock}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              />

              <Input
                label="Xác nhận mật khẩu mới (*)"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                icon={Lock}
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                required
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={changePasswordMutation.isPending}
                >
                  Đổi mật khẩu
                </Button>
              </div>
            </form>
          </Card>

          {/* Khu Vực Nguy Hiểm: Xóa Tài Khoản */}
          <Card className="p-6 border-coral/40 bg-coral/5">
            <CardHeader
              title="Xóa Tài Khoản Vĩnh Viễn"
              subtitle="Toàn bộ lịch sử chi tiêu, ví và mục tiêu sẽ bị xóa sạch"
            />
            <p className="text-xs text-ink-muted leading-relaxed mb-4">
              Hành động này không thể hoàn tác. Một khi đã xóa, toàn bộ dữ liệu tài chính của bạn trong hệ thống Pocketly sẽ bị hủy vĩnh viễn.
            </p>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Yêu cầu xóa tài khoản
            </Button>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog Xóa Tài Khoản */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteAccountMutation.mutate()}
        title="Xác nhận xóa tài khoản Pocketly"
        message="Bạn có chắc chắn 100% muốn xóa tài khoản của mình? Mọi dữ liệu giao dịch, ví tiền và mục tiêu tiết kiệm sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu."
        confirmText="Xóa tài khoản của tôi"
        isDanger
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  );
};
