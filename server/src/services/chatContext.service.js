import { prisma } from '../config/prisma.js';
import { formatDate, formatPercent, formatVND } from '../../../shared/formatters.js';

const fmt = formatVND;

// Hàm chuẩn hóa chuỗi tiếng Việt không dấu để matching từ khóa chính xác
const normalizeText = (text) => {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

export class ChatContextBuilder {
  /**
   * Truy xuất và tính toán dữ liệu tài chính chi tiết của người dùng
   */
  static async getFinancialSummary(userId) {
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

    const currency = '₫';
    const fullName = user?.fullName || 'Người dùng';

    // 2. Tổng số dư và chi tiết các ví
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { id: true, name: true, balance: true }
    });
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const walletDetails = wallets
      .map((w) => `- ${w.name}: ${fmt(w.balance)}`)
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

    const sortedCatsList = Object.entries(catMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, amount]) => {
        const pct = currentExpense > 0 ? Math.round((amount / currentExpense) * 100) : 0;
        return { name, amount, pct };
      });

    const sortedCats = sortedCatsList
      .slice(0, 5)
      .map((c) => `- ${c.name}: ${fmt(c.amount)} (${formatPercent(c.pct)})`)
      .join('\n');

    // 5. Tình hình ngân sách tháng này (Budget Status)
    const budgets = await prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
      include: { category: { select: { name: true } } }
    });

    const budgetList = budgets.map((b) => {
      const limit = Number(b.amount);
      const spent = b.categoryId ? catMap[b.category?.name] || 0 : currentExpense;
      const remaining = Math.max(0, limit - spent);
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const targetName = b.category ? `mục "${b.category.name}"` : 'toàn tháng';
      const statusText = pct >= 100 ? 'ĐÃ VƯỢT HẠN MỨC' : pct >= b.alertThreshold ? 'SẮP CHẠM HẠN MỨC' : 'Trong hạn mức';

      return {
        targetName,
        limit,
        spent,
        remaining,
        pct,
        statusText,
        line: `- Ngân sách ${targetName}: Hạn mức ${fmt(limit)}, đã tiêu ${fmt(spent)} (${formatPercent(pct)}) -> [${statusText}]`
      };
    });

    const budgetStatusLines = budgetList.map((b) => b.line);

    // 6. 10 giao dịch gần đây nhất
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      take: 10,
      orderBy: { date: 'desc' },
      include: {
        category: { select: { name: true } },
        wallet: { select: { name: true } }
      }
    });

    const txLines = recentTransactions.map((tx) => {
      const d = formatDate(tx.date);
      const sign = tx.type === 'INCOME' ? '+' : '-';
      const cat = tx.category?.name || 'Khác';
      const note = tx.note ? ` ("${tx.note}")` : '';
      return `- ${d}: [${tx.type === 'INCOME' ? 'Thu' : 'Chi'}] ${sign}${fmt(tx.amount)} | ${cat} qua ${tx.wallet?.name}${note}`;
    });

    // 7. Các mục tiêu tiết kiệm hiện có
    const savingGoals = await prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const goalList = savingGoals.map((g) => {
      const cur = Number(g.currentAmount);
      const tgt = Number(g.targetAmount);
      const pct = tgt > 0 ? Math.round((cur / tgt) * 100) : 0;
      const deadline = g.deadline ? ` (Hạn chót: ${formatDate(g.deadline)})` : '';
      return {
        title: g.title,
        current: cur,
        target: tgt,
        pct,
        deadline,
        line: `- "${g.title}": ${fmt(cur)} / ${fmt(tgt)} (${formatPercent(pct)})${deadline}`
      };
    });

    const goalLines = goalList.map((g) => g.line);

    // 8. Toàn bộ danh mục tài chính trong hệ thống (Default + Custom của user)
    const allCategories = await prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId }]
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }]
    });

    const expenseCategories = allCategories.filter((c) => c.type === 'EXPENSE');
    const incomeCategories = allCategories.filter((c) => c.type === 'INCOME');

    return {
      user: { fullName, currency },
      currentMonth,
      currentYear,
      wallets,
      totalBalance,
      walletDetails,
      currentIncome,
      currentExpense,
      netSavings,
      sortedCatsList,
      sortedCats,
      budgets: budgetList,
      budgetStatusLines,
      savingGoals: goalList,
      goalLines,
      recentTransactions,
      txLines,
      allCategories,
      expenseCategories,
      incomeCategories
    };
  }

  /**
   * Tóm tắt toàn bộ bức tranh tài chính THỰC TẾ của người dùng hiện tại
   * để đưa vào System Context cho AI.
   * Tự tính toán số liệu và đính kèm mục [SỐ ĐÃ TÍNH SẴN] để AI không tự làm toán.
   */
  static async buildFinancialContext(userId) {
    const data = await this.getFinancialSummary(userId);

    // 1. Số liệu thực tế từ database
    const income = data.currentIncome;
    const actualSpend = data.currentExpense;
    const netSavings = data.netSavings;
    const totalBalance = data.totalBalance;

    // 2. Tính toán ngân sách từ dữ liệu thật
    const categoryBudgets = (data.budgets || []).filter((b) => b.targetName !== 'toàn tháng');
    const overallBudget = (data.budgets || []).find((b) => b.targetName === 'toàn tháng');
    const totalBudgetLimit = categoryBudgets.length > 0
      ? categoryBudgets.reduce((s, b) => s + b.limit, 0)
      : (overallBudget?.limit || 0);

    const plannedSaving = income - totalBudgetLimit;
    const budgetStatus = totalBudgetLimit > 0
      ? (actualSpend <= totalBudgetLimit ? `TRONG HẠN MỨC (còn ${fmt(totalBudgetLimit - actualSpend)})` : `VƯỢT HẠN MỨC ${fmt(actualSpend - totalBudgetLimit)}`)
      : 'Chưa đặt hạn mức';

    // 3. Tính toán mục tiêu tiết kiệm từ dữ liệu thật
    const activeGoals = data.savingGoals || [];
    const primaryGoal = activeGoals.find((g) => g.current < g.target) || activeGoals[0];
    const goalTarget = primaryGoal ? primaryGoal.target : 0;
    const goalCurrent = primaryGoal ? primaryGoal.current : 0;
    const goalRemaining = Math.max(0, goalTarget - goalCurrent);

    // Đánh giá đạt/chưa đạt mục tiêu tiết kiệm
    let goalAssessment = 'Chưa thiết lập';
    if (primaryGoal) {
      if (netSavings >= goalRemaining) {
        goalAssessment = 'ĐẠT (tiền tiết kiệm tháng này đủ hoàn thành mục tiêu)';
      } else {
        const shortage = goalRemaining - netSavings;
        goalAssessment = `CHƯA ĐẠT, thiếu ${fmt(shortage)}`;
      }
    }

    // 4. Khối SỐ ĐÃ TÍNH SẴN (Server tự tính số, AI không tự cộng trừ)
    const computedSection = `
SỐ ĐÃ TÍNH SẴN:
- Tổng thu nhập: ${fmt(income)}
- Tổng chi: ${fmt(actualSpend)}
- Còn lại để tiết kiệm: ${fmt(netSavings)}
${totalBudgetLimit > 0 ? `- Tổng hạn mức ngân sách: ${fmt(totalBudgetLimit)} (${budgetStatus})
- Tiết kiệm dự kiến nếu chi đúng ngân sách: ${fmt(plannedSaving)}` : ''}
${primaryGoal ? `- Mục tiêu tiết kiệm ("${primaryGoal.title}"): ${fmt(goalTarget)} (${goalAssessment})
- Đã tích lũy trong mục tiêu: ${fmt(goalCurrent)}
- Còn thiếu để hoàn thành mục tiêu: ${fmt(goalRemaining)}` : '- Mục tiêu tiết kiệm: Chưa thiết lập'}
`.trim();

    return `
=== HỒ SƠ TÀI CHÍNH THỰC TẾ CỦA NGƯỜI DÙNG (${data.user.fullName}) ===
* Đơn vị tiền tệ: ₫
* Tổng số dư tài sản hiện có: ${fmt(data.totalBalance)}
Chi tiết các ví:
${data.walletDetails || 'Chưa có ví nào'}

* Tình hình tài chính Tháng ${data.currentMonth}/${data.currentYear}:
- Tổng thu nhập tháng: ${fmt(data.currentIncome)}
- Tổng chi tiêu tháng: ${fmt(data.currentExpense)}
- Tiết kiệm ròng tháng: ${fmt(data.netSavings)}

* Top danh mục chi tiêu nhiều nhất tháng này:
${data.sortedCats || 'Chưa có chi tiêu trong tháng'}

* Tình trạng ngân sách tháng này:
${data.budgetStatusLines.length > 0 ? data.budgetStatusLines.join('\n') : 'Chưa thiết lập ngân sách'}

* Danh sách mục tiêu tiết kiệm:
${data.goalLines.length > 0 ? data.goalLines.join('\n') : 'Chưa có mục tiêu tiết kiệm'}

* Danh sách toàn bộ danh mục thu/chi trong hệ thống:
- Chi tiêu: ${data.expenseCategories.map((c) => c.name).join(', ')}
- Thu nhập: ${data.incomeCategories.map((c) => c.name).join(', ')}

* 10 giao dịch gần đây nhất của người dùng:
${data.txLines.length > 0 ? data.txLines.join('\n') : 'Chưa có giao dịch'}

----------------------------------------
${computedSection}
===============================================================
`.trim();
  }

  /**
   * Phản hồi dạng Rule-based khi cả hai Provider AI đều gặp sự cố.
   * Nhận diện intent từ từ khóa (total spending this month, top category, budget status, savings goals, balance, all categories)
   * và chỉ trả lời đúng intent đó với số liệu thực tế từ database.
   * Không dùng emoji, không dùng bảng Markdown, xuống dòng hợp lý và số tiền định dạng chuẩn.
   */
  static async generateRuleBasedFallback(userId, question) {
    const query = normalizeText(question);

    // 0. Nhận diện intent: Liệt kê tất cả danh mục tài chính trong hệ thống (all categories)
    const isAllCategories =
      (query.includes('danh muc') && (
        query.includes('tat ca') ||
        query.includes('liet ke') ||
        query.includes('co trong') ||
        query.includes('he thong') ||
        query.includes('co nhung') ||
        query.includes('danh sach') ||
        query.includes('cac danh muc')
      )) ||
      query.includes('danh sach danh muc') ||
      query.includes('co nhung danh muc nao');

    // 1. Nhận diện intent: Top danh mục chi tiêu nhiều nhất (top category)
    const isTopCategory =
      !isAllCategories &&
      ((query.includes('danh muc') && (
        query.includes('nhieu nhat') ||
        query.includes('ton nhat') ||
        query.includes('lon nhat') ||
        query.includes('cao nhat') ||
        query.includes('top')
      )) ||
      query.includes('chi nhieu nhat') ||
      query.includes('tieu nhieu nhat') ||
      query.includes('ton tien') ||
      query.includes('khoan chi lon') ||
      query.includes('khoan chi cao') ||
      query.includes('chi vao dau') ||
      query.includes('tieu vao dau') ||
      query.includes('top chi'));

    // 2. Nhận diện intent: Tình hình ngân sách (budget status)
    const isBudget =
      query.includes('ngan sach') ||
      query.includes('han muc') ||
      query.includes('vuot muc') ||
      query.includes('canh bao chi tieu') ||
      (query.includes('con lai') && query.includes('sach'));

    // 3. Nhận diện intent: Mục tiêu tiết kiệm (savings goals)
    const isSavingGoal =
      query.includes('tiet kiem') ||
      query.includes('muc tieu') ||
      query.includes('heo dat') ||
      query.includes('tich luy') ||
      query.includes('quy phong ho');

    // 4. Nhận diện intent: Số dư / Tiền khả dụng (balance)
    const isBalance =
      query.includes('so du') ||
      query.includes('kha dung') ||
      query.includes('con bao nhieu tien') ||
      query.includes('con lai bao nhieu') ||
      query.includes('vi con') ||
      query.includes('trong vi') ||
      query.includes('cac vi') ||
      query.includes('tong tai san') ||
      query.includes('tai san');

    // 5. Nhận diện intent: Tổng chi tiêu tháng này (total spending this month)
    const isTotalSpending =
      query.includes('tong chi') ||
      query.includes('chi tieu') ||
      query.includes('tieu bao nhieu') ||
      query.includes('da tieu') ||
      query.includes('tieu het') ||
      query.includes('het bao nhieu') ||
      query.includes('chi het') ||
      query.includes('chi bao nhieu') ||
      query.includes('tong thu chi') ||
      query.includes('thu nhap') ||
      query.includes('chi phi');

    // Nếu không khớp với bất kỳ intent tài chính cá nhân nào:
    if (!isAllCategories && !isTopCategory && !isBudget && !isSavingGoal && !isBalance && !isTotalSpending) {
      return 'Mình chỉ hỗ trợ các câu hỏi về tài chính cá nhân nhé. Bạn thử hỏi về chi tiêu, ngân sách hoặc mục tiêu tiết kiệm xem!';
    }

    // Truy xuất số liệu tài chính thực tế từ database
    const data = await this.getFinancialSummary(userId);
    const { user, currentMonth, currentYear, totalBalance, wallets, currentIncome, currentExpense, netSavings, sortedCatsList, budgets, savingGoals, expenseCategories, incomeCategories } = data;

    // Trả lời CHỈ đúng intent khớp
    if (isAllCategories) {
      const expenseLines = expenseCategories.map((c) => `- ${c.name}`).join('\n');
      const incomeLines = incomeCategories.map((c) => `- ${c.name}`).join('\n');

      return `**Danh sách các danh mục tài chính trong Pocketly:**\n\n**Danh mục Chi tiêu (${expenseCategories.length})**\n${expenseLines}\n\n**Danh mục Thu nhập (${incomeCategories.length})**\n${incomeLines}`;
    }

    if (isTopCategory) {
      if (sortedCatsList.length === 0) {
        return `Trong tháng ${currentMonth}/${currentYear}, bạn chưa có khoản chi tiêu nào được ghi nhận.`;
      }

      const top1 = sortedCatsList[0];
      const categoryLines = sortedCatsList
        .slice(0, 5)
        .map((c, idx) => `${idx + 1}. **${c.name}**: ${fmt(c.amount)} — chiếm ${formatPercent(c.pct)} tổng chi tiêu.`)
        .join('\n');

      return `**Top danh mục chi tiêu nhiều nhất Tháng ${currentMonth}/${currentYear}**\n${categoryLines}\n\nKhoản chi lớn nhất là **${top1.name}**: ${fmt(top1.amount)} — chiếm ${formatPercent(top1.pct)} tổng chi tiêu.`;
    }

    if (isBudget) {
      if (budgets.length === 0) {
        return `Bạn chưa thiết lập hạn mức ngân sách nào cho Tháng ${currentMonth}/${currentYear}. Bạn có thể vào mục Ngân sách để thiết lập hạn mức chi tiêu cho các danh mục nhé.`;
      }

      const budgetLines = budgets
        .map((b) => `- ${b.targetName}: ${fmt(b.limit)} — đã tiêu ${fmt(b.spent)} (${formatPercent(b.pct)}), còn lại ${fmt(b.remaining)} [${b.statusText}].`)
        .join('\n');

      return `**Tình hình ngân sách Tháng ${currentMonth}/${currentYear}**\n${budgetLines}`;
    }

    if (isSavingGoal) {
      if (savingGoals.length === 0) {
        return `Hiện tại bạn chưa có mục tiêu tiết kiệm nào. Hãy tạo mục tiêu mới trong mục Tiết kiệm để cùng Pocketly tích lũy nhé.`;
      }

      const goalLines = savingGoals
        .map((g) => `- ${g.title}: ${fmt(g.current)} / ${fmt(g.target)} — đạt ${formatPercent(g.pct)}${g.deadline ? ' — ' + g.deadline : ''}.`)
        .join('\n');

      return `**Tiến độ các mục tiêu tiết kiệm hiện tại**\n${goalLines}`;
    }

    if (isBalance) {
      const walletList = wallets.length > 0
        ? wallets.map((w) => `- ${w.name}: ${fmt(w.balance)} — số dư khả dụng.`).join('\n')
        : 'Chưa có ví nào';

      return `**Số dư khả dụng hiện tại**\n- Tổng số dư tài sản: ${fmt(totalBalance)}\n\nChi tiết các ví:\n${walletList}`;
    }

    if (isTotalSpending) {
      return `**Tổng quan thu chi Tháng ${currentMonth}/${currentYear}**\n- Tổng chi: ${fmt(currentExpense)} — toàn bộ chi tiêu trong tháng.\n- Tổng thu nhập: ${fmt(currentIncome)} — toàn bộ thu nhập trong tháng.\n- Còn lại để tiết kiệm: ${fmt(netSavings)} — chênh lệch thu trừ chi.`;
    }

    return 'Mình chỉ hỗ trợ các câu hỏi về tài chính cá nhân nhé. Bạn thử hỏi về chi tiêu, ngân sách hoặc mục tiêu tiết kiệm xem!';
  }
}
