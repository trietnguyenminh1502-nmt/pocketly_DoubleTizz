import { ChatbotService } from '../services/chatbot.service.js';
import { successResponse } from '../utils/response.js';
import { createSessionSchema, sendMessageSchema } from '../validators/chat.validator.js';

export class ChatbotController {
  static async listSessions(req, res, next) {
    try {
      const sessions = await ChatbotService.listSessions(req.user.id);
      return successResponse(res, {
        message: 'Lấy danh sách phiên trò chuyện thành công',
        data: { sessions }
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSession(req, res, next) {
    try {
      const { title } = createSessionSchema.parse(req.body);
      const session = await ChatbotService.createSession(req.user.id, title);

      return successResponse(res, {
        status: 201,
        message: 'Tạo phiên trò chuyện mới thành công',
        data: { session }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMessages(req, res, next) {
    try {
      const { sessionId } = req.params;
      const data = await ChatbotService.getSessionMessages(req.user.id, sessionId);

      return successResponse(res, {
        message: 'Lấy lịch sử tin nhắn thành công',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { content } = sendMessageSchema.parse(req.body);

      const result = await ChatbotService.sendMessage(req.user.id, sessionId, content);

      return successResponse(res, {
        message: 'Gửi tin nhắn thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async clearSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      await ChatbotService.clearSession(req.user.id, sessionId);

      return successResponse(res, {
        message: 'Đã xóa toàn bộ nội dung trò chuyện trong phiên này'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      await ChatbotService.deleteSession(req.user.id, sessionId);

      return successResponse(res, {
        message: 'Xóa phiên trò chuyện thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}
