import ExcelJS from 'exceljs';
import { prisma } from '../config/prisma.js';
import { formatPercent } from '../../../shared/formatters.js';

export class ReportService {
  /**
   * Tổng quan tài chính Dashboard
   * (Số dư tổng các ví, thu nhập tháng này, chi tiêu tháng này, tỷ lệ tiết kiệm)
   */
  static async getSummary(userId) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const startOfLastMonth = new Date(currentYear, currentMonth - 2, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth - 1, 0, 23, 59, 59, 999);

    // 1. Tổng số dư tất cả ví
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { balance: true }
    });
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

    // 2. Thu nhập & Chi tiêu tháng hiện tại
    const currentMonthTxs = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: { gte: startOfCurrentMonth, lte: endOfCurrentMonth }
      },
      _sum: { amount: true }
    });

    let currentIncome = 0;
    let currentExpense = 0;
    currentMonthTxs.forEach((item) => {
      if (item.type === 'INCOME') currentIncome = Number(item._sum.amount || 0);
      if (item.type === 'EXPENSE') currentExpense = Number(item._sum.amount || 0);
    });

    const netSavings = currentIncome - currentExpense;
    const savingsRate = currentIncome > 0 ? Math.round((netSavings / currentIncome) * 100 * 10) / 10 : 0;

    // 3. Thu nhập & Chi tiêu tháng trước (để so sánh Month-over-Month)
    const lastMonthTxs = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { amount: true }
    });

    let lastIncome = 0;
    let lastExpense = 0;
    lastMonthTxs.forEach((item) => {
      if (item.type === 'INCOME') lastIncome = Number(item._sum.amount || 0);
      if (item.type === 'EXPENSE') lastExpense = Number(item._sum.amount || 0);
    });

    const incomeGrowth = lastIncome > 0 ? Math.round(((currentIncome - lastIncome) / lastIncome) * 100 * 10) / 10 : 0;
    const expenseGrowth = lastExpense > 0 ? Math.round(((currentExpense - lastExpense) / lastExpense) * 100 * 10) / 10 : 0;

    return {
      totalBalance,
      currentMonth: {
        month: currentMonth,
        year: currentYear,
        income: currentIncome,
        expense: currentExpense,
        netSavings,
        savingsRate
      },
      momComparison: {
        lastMonthIncome: lastIncome,
        lastMonthExpense: lastExpense,
        incomeGrowthPercentage: incomeGrowth,
        expenseGrowthPercentage: expenseGrowth
      }
    };
  }

  /**
   * Cơ cấu chi tiêu theo danh mục (cho Biểu đồ Donut / Pie)
   */
  static async getSpendingByCategory(userId, { month, year, fromMonth, toMonth } = {}) {
    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    let startOfMonth, endOfMonth, labelPeriod;
    if (fromMonth && toMonth) {
      const fM = Math.max(1, Math.min(12, parseInt(fromMonth, 10)));
      const tM = Math.max(fM, Math.min(12, parseInt(toMonth, 10)));
      startOfMonth = new Date(targetYear, fM - 1, 1);
      endOfMonth = new Date(targetYear, tM, 0, 23, 59, 59, 999);
      labelPeriod = `Tháng ${fM} - ${tM}/${targetYear}`;
    } else {
      const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
      startOfMonth = new Date(targetYear, targetMonth - 1, 1);
      endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
      labelPeriod = `Tháng ${targetMonth}/${targetYear}`;
    }

    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true }
        }
      }
    });

    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const categoryMap = {};
    expenses.forEach((e) => {
      const catId = e.categoryId;
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          categoryId: catId,
          name: e.category?.name || 'Khác',
          color: e.category?.color || '#D4F05A',
          icon: e.category?.icon || 'Tag',
          amount: 0,
          count: 0
        };
      }
      categoryMap[catId].amount += Number(e.amount);
      categoryMap[catId].count += 1;
    });

    const categories = Object.values(categoryMap).map((cat) => ({
      ...cat,
      percentage: totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100 * 10) / 10 : 0
    }));

    // Sắp xếp giảm dần theo số tiền chi
    categories.sort((a, b) => b.amount - a.amount);

    return {
      month: month || now.getMonth() + 1,
      year: targetYear,
      period: labelPeriod,
      totalExpense,
      categories
    };
  }

  /**
   * Xu hướng Thu - Chi qua các tháng (hoặc khoảng tháng fromMonth -> toMonth của year)
   */
  static async getMonthlyTrends(userId, { months, year, fromMonth, toMonth } = {}) {
    const now = new Date();
    const result = [];

    // Nếu có chọn năm và khoảng tháng (từ tháng ... đến tháng ...)
    if (year && fromMonth && toMonth) {
      const y = parseInt(year, 10);
      const fM = Math.max(1, Math.min(12, parseInt(fromMonth, 10)));
      const tM = Math.max(fM, Math.min(12, parseInt(toMonth, 10)));

      for (let m = fM; m <= tM; m++) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59, 999);

        const txs = await prisma.transaction.groupBy({
          by: ['type'],
          where: {
            userId,
            date: { gte: start, lte: end }
          },
          _sum: { amount: true }
        });

        let income = 0;
        let expense = 0;
        txs.forEach((item) => {
          if (item.type === 'INCOME') income = Number(item._sum.amount || 0);
          if (item.type === 'EXPENSE') expense = Number(item._sum.amount || 0);
        });

        result.push({
          label: `T${m}/${y}`,
          month: m,
          year: y,
          income,
          expense,
          savings: income - expense
        });
      }

      return result;
    }

    // Mặc định: N tháng gần nhất
    const count = months ? parseInt(months, 10) : 6;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);

      const txs = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
          userId,
          date: { gte: start, lte: end }
        },
        _sum: { amount: true }
      });

      let income = 0;
      let expense = 0;
      txs.forEach((item) => {
        if (item.type === 'INCOME') income = Number(item._sum.amount || 0);
        if (item.type === 'EXPENSE') expense = Number(item._sum.amount || 0);
      });

      result.push({
        label: `T${m}/${y}`,
        month: m,
        year: y,
        income,
        expense,
        savings: income - expense
      });
    }

    return result;
  }

  /**
   * Top danh mục chi tiêu nhiều nhất
   */
  static async getTopCategories(userId, { limit = 5, month, year, fromMonth, toMonth } = {}) {
    const data = await this.getSpendingByCategory(userId, { month, year, fromMonth, toMonth });
    return data.categories.slice(0, limit);
  }

  /**
   * Xuất báo cáo tài chính tổng hợp sang file Excel (ExcelJS)
   */
  static async exportReportToExcel(userId, { month, year, fromMonth, toMonth } = {}) {
    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    const isRange = Boolean(fromMonth && toMonth);
    const fM = isRange ? parseInt(fromMonth, 10) : (month ? parseInt(month, 10) : now.getMonth() + 1);
    const tM = isRange ? parseInt(toMonth, 10) : fM;

    const [trends, categoryReport] = await Promise.all([
      this.getMonthlyTrends(userId, { year: targetYear, fromMonth: fM, toMonth: tM }),
      this.getSpendingByCategory(userId, { year: targetYear, fromMonth: fM, toMonth: tM })
    ]);

    const totalIncome = trends.reduce((sum, t) => sum + t.income, 0);
    const totalExpense = trends.reduce((sum, t) => sum + t.expense, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100 * 10) / 10 : 0;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Pocketly 🌿';
    workbook.created = new Date();

    const periodTitle = isRange
      ? `Tháng ${fM} - Tháng ${tM} Năm ${targetYear}`
      : `Tháng ${fM}/${targetYear}`;

    // Sheet 1: Báo cáo Tổng quan
    const sheet1 = workbook.addWorksheet(`Tổng Quan`);
    sheet1.columns = [
      { header: 'Chỉ Số Tài Chính', key: 'metric', width: 34 },
      { header: 'Giá Trị (VND)', key: 'value', width: 24 }
    ];

    sheet1.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF123D2F' } };
    });

    sheet1.addRow({ metric: 'Kỳ báo cáo', value: periodTitle });
    sheet1.addRow({ metric: 'Tổng thu nhập', value: totalIncome });
    sheet1.addRow({ metric: 'Tổng chi tiêu', value: totalExpense });
    sheet1.addRow({ metric: 'Tiền tiết kiệm ròng', value: netSavings });
    sheet1.addRow({ metric: 'Tỷ lệ tiết kiệm', value: formatPercent(savingsRate) });

    [3, 4, 5].forEach((rowNum) => {
      sheet1.getCell(`B${rowNum}`).numFmt = '#,##0 "₫"';
      sheet1.getCell(`B${rowNum}`).font = { bold: true };
    });

    // Sheet 2: Cơ cấu chi tiêu theo danh mục
    const sheet2 = workbook.addWorksheet(`Cơ Cấu Chi Tiêu`);
    sheet2.columns = [
      { header: 'Danh Mục', key: 'name', width: 26 },
      { header: 'Số Tiền (VND)', key: 'amount', width: 20 },
      { header: 'Tỷ Lệ (%)', key: 'percentage', width: 14 },
      { header: 'Số Giao Dịch', key: 'count', width: 16 }
    ];

    sheet2.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6A2B' } };
    });

    categoryReport.categories.forEach((cat) => {
      const r = sheet2.addRow({
        name: cat.name,
        amount: cat.amount,
        percentage: formatPercent(cat.percentage),
        count: cat.count
      });
      r.getCell('amount').numFmt = '#,##0 "₫"';
    });

    // Sheet 3: Xu hướng từng tháng
    const sheet3 = workbook.addWorksheet(`Xu Hướng Các Tháng`);
    sheet3.columns = [
      { header: 'Tháng', key: 'label', width: 14 },
      { header: 'Thu Nhập (VND)', key: 'income', width: 20 },
      { header: 'Chi Tiêu (VND)', key: 'expense', width: 20 },
      { header: 'Tiết Kiệm (VND)', key: 'savings', width: 20 }
    ];

    sheet3.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF123D2F' } };
    });

    trends.forEach((t) => {
      const r = sheet3.addRow(t);
      r.getCell('income').numFmt = '#,##0 "₫"';
      r.getCell('expense').numFmt = '#,##0 "₫"';
      r.getCell('savings').numFmt = '#,##0 "₫"';
    });

    return await workbook.xlsx.writeBuffer();
  }
}
