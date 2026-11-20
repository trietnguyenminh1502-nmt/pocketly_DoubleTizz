import { ReportService } from '../services/report.service.js';
import { successResponse } from '../utils/response.js';

export class ReportController {
  static async getSummary(req, res, next) {
    try {
      const summary = await ReportService.getSummary(req.user.id);
      return successResponse(res, {
        message: 'Lấy dữ liệu tổng quan Dashboard thành công',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSpendingByCategory(req, res, next) {
    try {
      const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
      const fromMonth = req.query.fromMonth ? parseInt(req.query.fromMonth, 10) : undefined;
      const toMonth = req.query.toMonth ? parseInt(req.query.toMonth, 10) : undefined;

      const data = await ReportService.getSpendingByCategory(req.user.id, { month, year, fromMonth, toMonth });
      return successResponse(res, {
        message: 'Lấy dữ liệu cơ cấu chi tiêu thành công',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTrends(req, res, next) {
    try {
      const months = req.query.months ? parseInt(req.query.months, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
      const fromMonth = req.query.fromMonth ? parseInt(req.query.fromMonth, 10) : undefined;
      const toMonth = req.query.toMonth ? parseInt(req.query.toMonth, 10) : undefined;

      const trends = await ReportService.getMonthlyTrends(req.user.id, { months, year, fromMonth, toMonth });

      return successResponse(res, {
        message: 'Lấy dữ liệu xu hướng thu chi thành công',
        data: { trends }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTopCategories(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
      const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
      const fromMonth = req.query.fromMonth ? parseInt(req.query.fromMonth, 10) : undefined;
      const toMonth = req.query.toMonth ? parseInt(req.query.toMonth, 10) : undefined;

      const topCategories = await ReportService.getTopCategories(req.user.id, { limit, month, year, fromMonth, toMonth });
      return successResponse(res, {
        message: 'Lấy top danh mục chi tiêu thành công',
        data: { topCategories }
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportExcel(req, res, next) {
    try {
      const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
      const fromMonth = req.query.fromMonth ? parseInt(req.query.fromMonth, 10) : undefined;
      const toMonth = req.query.toMonth ? parseInt(req.query.toMonth, 10) : undefined;

      const buffer = await ReportService.exportReportToExcel(req.user.id, { month, year, fromMonth, toMonth });

      const fileName = fromMonth && toMonth
        ? `pocketly-report-T${fromMonth}-T${toMonth}-${year || new Date().getFullYear()}.xlsx`
        : `pocketly-report-T${month || new Date().getMonth() + 1}-${year || new Date().getFullYear()}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${fileName}`
      );

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}
