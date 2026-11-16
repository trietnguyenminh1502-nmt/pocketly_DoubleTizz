import { prisma } from '../config/prisma.js';

export class ChatContextBuilder {
  /**
   * Tóm tắt toàn bộ bức tranh tài chính THỰC TẾ của người dùng hiện tại
   * để đưa vào System Context cho Gemini AI
   */
  static async buildFinancialContext(userId) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // 1. Thông tin user & tiền tệ
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, currency: true }
    });

    // 2. Tổng số dư và chi tiết các ví
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { name: true, balance: true }
    });
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const walletDetails = wallets
      .map((w) => `- ${w.name}: ${Number(w.balance).toLocaleString('vi-VN')} ${user.currency}`)
      .join('\n');

    // 3. Tổng thu & chi tháng này
    const monthlyTxs = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    });

    let currentIncome = 0;
    let currentExpense = 0;
    monthlyTxs.forEach((item) => {
      if (item.type === 'INCOME') currentIncome = Number(item._sum.amount || 0);
      if (item.type === 'EXPENSE') currentExpense = Number(item._sum.amount || 0);
    });

    const netSavings = currentIncome - currentExpense;

    // 4. Cơ cấu chi tiêu theo danh mục tháng này (Top Categories)
    const categoryExpenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      include: {
        category: { select: { name: true } }
      }
    });

    const catMap = {};
    categoryExpenses.forEach((tx) => {
      const name = tx.category?.name || 'Khác';
      catMap[name] = (catMap[name] || 0) + Number(tx.amount);
    });

    const sortedCats = Object.entries(catMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, amount]) => {
        const pct = currentExpense > 0 ? Math.round((amount / currentExpense) * 100) : 0;
        return `- ${name}: ${amount.toLocaleString('vi-VN')} ${user.currency} (${pct}%)`;
      })
      .slice(0, 5)
      .join('\n');

    // 5. Tình hình ngân sách tháng này (Budget Status)
    const budgets = await prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
      include: { category: { select: { name: true } } }
    });

    const budgetStatusLines = budgets.map((b) => {
      const limit = Number(b.amount);
      const spent = b.categoryId ? catMap[b.category?.name] || 0 : currentExpense;
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const targetName = b.category ? `mục "${b.category.name}"` : 'toàn tháng';
      const statusText = pct >= 100 ? 'ĐÃ VƯỢT HẠN MỨC ⚠️' : pct >= b.alertThreshold ? 'SẮP CHẠM HẠN MỨC 🔔' : 'Bình thường ✅';

      return `- Ngân sách ${targetName}: Hạn mức ${limit.toLocaleString('vi-VN')} ${user.currency}, đã tiêu ${spent.toLocaleString('vi-VN')} ${user.currency} (${pct}%) -> [${statusText}]`;
    });

    // 6. 20 giao dịch gần đây nhất
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      take: 20,
      orderBy: { date: 'desc' },
      include: {
        category: { select: { name: true } },
        wallet: { select: { name: true } }
      }
    });

    const txLines = recentTransactions.map((tx) => {
      const d = new Date(tx.date).toLocaleDateString('vi-VN');
      const sign = tx.type === 'INCOME' ? '+' : '-';
      const cat = tx.category?.name || 'Khác';
      const note = tx.note ? ` ("${tx.note}")` : '';
      return `- ${d}: [${tx.type === 'INCOME' ? 'Thu' : 'Chi'}] ${sign}${Number(tx.amount).toLocaleString('vi-VN')} ${user.currency} | ${cat} qua ${tx.wallet?.name}${note}`;
    });

    // 7. Các mục tiêu tiết kiệm hiện có
    const savingGoals = await prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const goalLines = savingGoals.map((g) => {
      const cur = Number(g.currentAmount);
      const tgt = Number(g.targetAmount);
      const pct = tgt > 0 ? Math.round((cur / tgt) * 100) : 0;
      const deadline = g.deadline ? ` (Hạn chót: ${new Date(g.deadline).toLocaleDateString('vi-VN')})` : '';
      return `- "${g.title}": ${cur.toLocaleString('vi-VN')} / ${tgt.toLocaleString('vi-VN')} ${user.currency} (${pct}%)${deadline}`;
    });

    // Xây dựng chuỗi Context hoàn chỉnh
    return `
=== HỒ SƠ TÀI CHÍNH THỰC TẾ CỦA NGƯỜI DÙNG (${user.fullName}) ===
* Đơn vị tiền tệ: ${user.currency}
* Tổng số dư tài sản hiện có: ${totalBalance.toLocaleString('vi-VN')} ${user.currency}
Chi tiết các ví:
${walletDetails || 'Chưa có ví nào'}

* Tình hình tài chính Tháng ${currentMonth}/${currentYear}:
- Tổng thu nhập tháng: ${currentIncome.toLocaleString('vi-VN')} ${user.currency}
- Tổng chi tiêu tháng: ${currentExpense.toLocaleString('vi-VN')} ${user.currency}
- Tiết kiệm ròng tháng: ${netSavings.toLocaleString('vi-VN')} ${user.currency}

* Top danh mục chi tiêu nhiều nhất tháng này:
${sortedCats || 'Chưa có chi tiêu trong tháng'}

* Tình trạng ngân sách tháng này:
${budgetStatusLines.length > 0 ? budgetStatusLines.join('\n') : 'Chưa thiết lập ngân sách'}

* Danh sách mục tiêu tiết kiệm:
${goalLines.length > 0 ? goalLines.join('\n') : 'Chưa có mục tiêu tiết kiệm'}

* 20 giao dịch gần đây nhất của người dùng:
${txLines.length > 0 ? txLines.join('\n') : 'Chưa có giao dịch'}
===============================================================
`.trim();
  }
}
