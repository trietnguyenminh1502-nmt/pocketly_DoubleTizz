import { PrismaClient, Role, UserStatus, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Project palette tokens
// Primary Forest Green: #123D2F, Accent Tangerine: #FF6A2B, Accent Lime: #D4F05A
// Coral (Expense): #FF8A7A, Mint: #BFE8D6, Sand: #EBDFC7
const DEFAULT_CATEGORIES = [
  // Expense categories (coral / tangerine / sand tones)
  { name: 'Ăn uống', icon: 'Utensils', color: '#FF6A2B', type: TransactionType.EXPENSE, isDefault: true },
  { name: 'Di chuyển', icon: 'Bus', color: '#FF8A7A', type: TransactionType.EXPENSE, isDefault: true },
  { name: 'Tiền thuê trọ', icon: 'Home', color: '#E57373', type: TransactionType.EXPENSE, isDefault: true },
  { name: 'Học tập & Giáo trình', icon: 'GraduationCap', color: '#D4A373', type: TransactionType.EXPENSE, isDefault: true },
  { name: 'Giải trí & Phim ảnh', icon: 'Gamepad2', color: '#FF9F1C', type: TransactionType.EXPENSE, isDefault: true },
  { name: 'Mua sắm cá nhân', icon: 'ShoppingBag', color: '#E07A5F', type: TransactionType.EXPENSE, isDefault: true },
  { name: 'Sức khỏe & Y tế', icon: 'HeartPulse', color: '#F28482', type: TransactionType.EXPENSE, isDefault: true },

  // Income categories (green / mint / lime tones)
  { name: 'Lương đi làm', icon: 'Briefcase', color: '#123D2F', type: TransactionType.INCOME, isDefault: true },
  { name: 'Trợ cấp gia đình', icon: 'HandCoins', color: '#2D6A4F', type: TransactionType.INCOME, isDefault: true },
  { name: 'Việc làm thêm / Freelance', icon: 'Laptop', color: '#40916C', type: TransactionType.INCOME, isDefault: true },
  { name: 'Học bổng & Thưởng', icon: 'Award', color: '#52B788', type: TransactionType.INCOME, isDefault: true }
];

// Student realistic expense items template
const EXPENSE_TEMPLATES = [
  { name: 'Ăn uống', note: 'Cơm trưa căn tin trường', min: 25000, max: 40000, freq: 25 },
  { name: 'Ăn uống', note: 'Cà phê sáng học nhóm', min: 20000, max: 45000, freq: 15 },
  { name: 'Ăn uống', note: 'Ăn tối bún đậu cùng bạn bè', min: 45000, max: 80000, freq: 10 },
  { name: 'Ăn uống', note: 'Trà sữa chiều', min: 28000, max: 55000, freq: 8 },
  { name: 'Ăn uống', note: 'Đi siêu thị mua thực phẩm nấu ăn', min: 120000, max: 300000, freq: 6 },
  { name: 'Di chuyển', note: 'Đổ xăng xe máy', min: 50000, max: 80000, freq: 6 },
  { name: 'Di chuyển', note: 'Vé xe bus tháng / vé lượt', min: 7000, max: 100000, freq: 8 },
  { name: 'Di chuyển', note: 'Đặt xe công nghệ Grab/Be đi mưa', min: 30000, max: 65000, freq: 5 },
  { name: 'Học tập & Giáo trình', note: 'In ấn tài liệu học & tiểu luận', min: 15000, max: 50000, freq: 6 },
  { name: 'Học tập & Giáo trình', note: 'Mua sách giáo trình chuyên ngành', min: 70000, max: 180000, freq: 2 },
  { name: 'Giải trí & Phim ảnh', note: 'Xem phim rạp cuối tuần', min: 75000, max: 120000, freq: 3 },
  { name: 'Giải trí & Phim ảnh', note: 'Gói nghe nhạc Spotify / Netflix SV', min: 29000, max: 59000, freq: 2 },
  { name: 'Mua sắm cá nhân', note: 'Đồ dùng cá nhân / mỹ phẩm / dầu gội', min: 50000, max: 150000, freq: 4 },
  { name: 'Mua sắm cá nhân', note: 'Quần áo Shopee săn sale', min: 120000, max: 350000, freq: 2 },
  { name: 'Sức khỏe & Y tế', note: 'Thuốc cảm / vitamin C', min: 30000, max: 90000, freq: 2 }
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.info('🌱 Bắt đầu gieo dữ liệu mẫu (Seeding)...');

  // 1. Dọn dẹp dữ liệu cũ theo thứ tự quan hệ an toàn
  await prisma.auditLog.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savingGoal.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.category.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.info('🧹 Đã xóa sạch dữ liệu cũ.');

  // 2. Tạo Mật khẩu băm
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const userPasswordHash = await bcrypt.hash('User@123', 10);

  // 3. Tạo Admin User
  const admin = await prisma.user.create({
    data: {
      fullName: 'Quản Trị Viên Pocketly',
      email: 'admin@pocketly.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      currency: 'VND'
    }
  });
  console.info(`👤 Đã tạo Admin: ${admin.email} (Mật khẩu: Admin@123)`);

  // 4. Tạo 2 Demo Users
  const user1 = await prisma.user.create({
    data: {
      fullName: 'Nguyễn Minh Trí',
      email: 'user1@pocketly.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      currency: 'VND'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      fullName: 'Trần Phương Thảo',
      email: 'user2@pocketly.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      currency: 'VND'
    }
  });
  console.info(`👥 Đã tạo 2 Demo Users: user1@pocketly.com, user2@pocketly.com (Mật khẩu: User@123)`);

  // 5. Tạo Danh mục mặc định của hệ thống
  const createdCategories = [];
  for (const cat of DEFAULT_CATEGORIES) {
    const created = await prisma.category.create({
      data: cat
    });
    createdCategories.push(created);
  }
  console.info(`🏷️ Đã tạo ${createdCategories.length} danh mục mặc định của hệ thống.`);

  const categoryMap = new Map();
  createdCategories.forEach((c) => categoryMap.set(c.name, c));

  const demoUsers = [user1, user2];

  for (const user of demoUsers) {
    console.info(`\n🚀 Đang tạo dữ liệu cho sinh viên: ${user.fullName} (${user.email})...`);

    // 6. Tạo 3 Ví cho mỗi user
    const walletCash = await prisma.wallet.create({
      data: {
        userId: user.id,
        name: 'Tiền mặt',
        balance: 500000,
        icon: 'Banknote'
      }
    });

    const walletBank = await prisma.wallet.create({
      data: {
        userId: user.id,
        name: 'Tài khoản MB Bank',
        balance: 3250000,
        icon: 'CreditCard'
      }
    });

    const walletMomo = await prisma.wallet.create({
      data: {
        userId: user.id,
        name: 'Ví điện tử MoMo',
        balance: 850000,
        icon: 'Smartphone'
      }
    });

    const userWallets = [walletCash, walletBank, walletMomo];

    // 7. Tạo khoảng 150 giao dịch thực tế trong 6 tháng vừa qua
    const now = new Date();
    const transactionsData = [];

    // Tạo các nguồn thu cố định hàng tháng trong 6 tháng qua (Trợ cấp + Làm thêm)
    for (let m = 5; m >= 0; m--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

      // Ngày 3-5 hàng tháng: Trợ cấp gia đình (3.500.000 - 4.500.000đ) vào Ngân hàng
      const allowanceCategory = categoryMap.get('Trợ cấp gia đình');
      if (allowanceCategory) {
        transactionsData.push({
          userId: user.id,
          categoryId: allowanceCategory.id,
          walletId: walletBank.id,
          type: TransactionType.INCOME,
          amount: getRandomInt(35, 45) * 100000,
          note: `Bố mẹ gửi tiền sinh hoạt phí tháng ${monthDate.getMonth() + 1}`,
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), getRandomInt(3, 5), 10, 30)
        });
      }

      // Ngày 10-12 hàng tháng: Lương part-time/gia sư (1.800.000 - 2.800.000đ) vào Ngân hàng hoặc MoMo
      const salaryCategory = categoryMap.get('Việc làm thêm / Freelance') || categoryMap.get('Lương đi làm');
      if (salaryCategory) {
        transactionsData.push({
          userId: user.id,
          categoryId: salaryCategory.id,
          walletId: getRandomItem([walletBank, walletMomo]).id,
          type: TransactionType.INCOME,
          amount: getRandomInt(18, 28) * 100000,
          note: `Lương trợ giảng / gia sư tháng ${monthDate.getMonth() + 1}`,
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), getRandomInt(10, 12), 17, 0)
        });
      }

      // Ngày 5-7 hàng tháng: Tiền phòng trọ + điện nước cố định (1.600.000 - 2.200.000đ)
      const rentCategory = categoryMap.get('Tiền thuê trọ');
      if (rentCategory) {
        transactionsData.push({
          userId: user.id,
          categoryId: rentCategory.id,
          walletId: walletBank.id,
          type: TransactionType.EXPENSE,
          amount: getRandomInt(16, 22) * 100000,
          note: `Đóng tiền phòng trọ và điện nước tháng ${monthDate.getMonth() + 1}`,
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), getRandomInt(5, 7), 19, 15)
        });
      }

      // Sinh ngẫu nhiên 22-26 chi tiêu nhỏ hàng ngày trong mỗi tháng (~ 140 - 155 giao dịch tổng cộng)
      const targetCountThisMonth = getRandomInt(22, 25);
      for (let i = 0; i < targetCountThisMonth; i++) {
        const template = getRandomItem(EXPENSE_TEMPLATES);
        const cat = categoryMap.get(template.name);
        if (!cat) continue;

        // Làm tròn đến hàng nghìn đồng
        const rawAmount = getRandomInt(template.min, template.max);
        const roundedAmount = Math.round(rawAmount / 1000) * 1000;

        const randomDay = getRandomInt(1, Math.min(daysInMonth, m === 0 ? now.getDate() : daysInMonth));
        const randomHour = getRandomInt(7, 22);
        const randomMinute = getRandomInt(0, 59);

        // Chọn ví phù hợp: tiền nhỏ dùng tiền mặt/MoMo, tiền lớn dùng ngân hàng
        let chosenWallet = walletCash;
        if (roundedAmount > 100000) {
          chosenWallet = walletBank;
        } else if (Math.random() > 0.5) {
          chosenWallet = walletMomo;
        }

        transactionsData.push({
          userId: user.id,
          categoryId: cat.id,
          walletId: chosenWallet.id,
          type: TransactionType.EXPENSE,
          amount: roundedAmount,
          note: template.note,
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay, randomHour, randomMinute)
        });
      }
    }

    // Ghi hàng loạt giao dịch
    await prisma.transaction.createMany({
      data: transactionsData
    });
    console.info(`💳 Đã tạo ${transactionsData.length} giao dịch chân thực trong 6 tháng qua.`);

    // 8. Tạo Ngân sách mẫu (Budgets) cho tháng hiện tại
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Ngân sách tổng tháng
    await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: null, // Ngân sách tổng
        amount: 4500000,
        month: currentMonth,
        year: currentYear,
        alertThreshold: 80
      }
    });

    // Ngân sách ăn uống
    const foodCat = categoryMap.get('Ăn uống');
    if (foodCat) {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: foodCat.id,
          amount: 2000000,
          month: currentMonth,
          year: currentYear,
          alertThreshold: 85
        }
      });
    }

    // Ngân sách giải trí
    const entCat = categoryMap.get('Giải trí & Phim ảnh');
    if (entCat) {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: entCat.id,
          amount: 500000,
          month: currentMonth,
          year: currentYear,
          alertThreshold: 75
        }
      });
    }
    console.info(`📊 Đã tạo ngân sách mẫu cho tháng ${currentMonth}/${currentYear}.`);

    // 9. Tạo Mục tiêu tiết kiệm (Saving Goals)
    const laptopDeadline = new Date(now.getFullYear(), now.getMonth() + 4, 30);
    const tripDeadline = new Date(now.getFullYear(), now.getMonth() + 2, 15);

    await prisma.savingGoal.createMany({
      data: [
        {
          userId: user.id,
          title: 'Đổi Laptop mới phục vụ làm đồ án tốt nghiệp',
          targetAmount: 18000000,
          currentAmount: 7500000,
          deadline: laptopDeadline
        },
        {
          userId: user.id,
          title: 'Chuyến du lịch hè Đà Lạt cùng lớp',
          targetAmount: 2500000,
          currentAmount: 1650000,
          deadline: tripDeadline
        },
        {
          userId: user.id,
          title: 'Quỹ dự phòng khẩn cấp y tế',
          targetAmount: 3000000,
          currentAmount: 2100000,
          deadline: null
        }
      ]
    });
    console.info(`🎯 Đã tạo 3 mục tiêu tiết kiệm mẫu sinh viên.`);

    // 10. Tạo Thông báo chào mừng
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          title: 'Chào mừng bạn đến với Pocketly! 🌿',
          message: 'Bắt đầu theo dõi các khoản chi tiêu hàng ngày và nhận trợ giúp tài chính từ AI Chatbot nhé!',
          type: 'INFO',
          isRead: true
        },
        {
          userId: user.id,
          title: 'Nhắc nhở ngân sách tháng ⚠️',
          message: 'Chi phí cho mục "Ăn uống" tuần này đang tiến gần tới ngưỡng cảnh báo 85%.',
          type: 'BUDGET_ALERT',
          isRead: false
        }
      ]
    });
  }

  // 11. Ghi một Audit Log mẫu cho Admin
  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: 'SYSTEM_INITIAL_SEED',
      targetId: 'ALL'
    }
  });

  console.info('\n🎉 SEED DỮ LIỆU HOÀN TẤT THÀNH CÔNG VÀ SẴN SÀNG SỬ DỤNG!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
