import { SupportService } from '../services/support.service.js';
import { successResponse } from '../utils/response.js';

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export class SupportController {
  /**
   * [POST /api/v1/support] Người dùng gửi yêu cầu hỗ trợ mới (Public)
   */
  static async createTicket(req, res, next) {
    try {
      const { fullName, email, topic, message } = req.body;
      const ticket = await SupportService.createTicket({ fullName, email, topic, message });

      // Gửi email thông báo cho ban quản trị nếu đã cấu hình SMTP
      try {
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: `"Pocketly Support" <${process.env.SMTP_USER}>`,
            to: 'tvocabs1502@gmail.com',
            subject: `[Pocketly] ${topic} – from ${fullName}`,
            text: `
              Người gửi: ${fullName}
              Email: ${email}
              Chủ đề: ${topic}

              Nội dung:
              ${message}
            `,
          });
        }
      } catch (mailErr) {
        console.warn('⚠️ Không thể gửi email thông báo qua SMTP:', mailErr.message);
      }

      return successResponse(res, {
        statusCode: 201,
        message: 'Gửi yêu cầu hỗ trợ thành công. Đội ngũ Pocketly sẽ liên hệ qua email sớm nhất!',
        data: { ticket }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST /api/v1/support/email] Gửi email hỗ trợ thực tế và lưu vào hệ thống
   */
  static async sendEmail(req, res, next) {
    try {
      const { fullName, email, topic, message } = req.body;

      // 1. Lưu ticket vào database để Admin luôn xem được trên trang quản trị
      const ticket = await SupportService.createTicket({ fullName, email, topic, message });

      // 2. Gửi email thông báo
      try {
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          const mailOptions = {
            from: `"Pocketly Support" <${process.env.SMTP_USER}>`,
            to: 'tvocabs1502@gmail.com',
            subject: `[Pocketly] ${topic} – from ${fullName}`,
            text: `
              Người gửi: ${fullName}
              Email: ${email}
              Chủ đề: ${topic}

              Nội dung:
              ${message}
            `,
          };

          await transporter.sendMail(mailOptions);
        }
      } catch (mailErr) {
        console.warn('⚠️ Không thể gửi email qua SMTP:', mailErr.message);
      }

      return successResponse(res, {
        statusCode: 201,
        message: 'Gửi yêu cầu hỗ trợ thành công. Đội ngũ Pocketly sẽ liên hệ qua email sớm nhất!',
        data: { ticket }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * [GET /api/v1/support/admin] Admin xem danh sách các yêu cầu
   */
  static async listTickets(req, res, next) {
    try {
      const { status, topic, search, page, limit } = req.query;
      const result = await SupportService.listTickets({ status, topic, search, page, limit });

      return successResponse(res, {
        message: 'Lấy danh sách yêu cầu hỗ trợ thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PATCH /api/v1/support/admin/:id] Admin cập nhật trạng thái hoặc ghi chú
   */
  static async updateTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const updated = await SupportService.updateTicket(id, { status, notes });

      return successResponse(res, {
        message: 'Cập nhật yêu cầu hỗ trợ thành công',
        data: { ticket: updated }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE /api/v1/support/admin/:id] Admin xóa yêu cầu
   */
  static async deleteTicket(req, res, next) {
    try {
      const { id } = req.params;
      await SupportService.deleteTicket(id);

      return successResponse(res, {
        message: 'Xóa yêu cầu hỗ trợ thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}
