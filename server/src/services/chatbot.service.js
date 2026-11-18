import dotenv from 'dotenv';
import { prisma } from '../config/prisma.js';
import { config } from '../config/index.js';
import { ChatContextBuilder } from './chatContext.service.js';
import { GeminiProvider, GroqProvider } from './providers/index.js';

export class ChatbotService {
  /**
   * Lấy danh sách phiên chat của user
   */
  static async listSessions(userId) {
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } }
      }
    });
    return sessions;
  }

  /**
   * Tạo phiên chat mới
   */
  static async createSession(userId, title) {
    const session = await prisma.chatSession.create({
      data: {
        userId,
        title: title || 'Phiên tư vấn mới'
      }
    });
    return session;
  }

  /**
   * Lấy lịch sử tin nhắn của một phiên
   */
  static async getSessionMessages(userId, sessionId) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      const err = new Error('Phiên trò chuyện không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });

    return { session, messages };
  }

  /**
   * Xóa toàn bộ tin nhắn trong một phiên (Clear session)
   */
  static async clearSession(userId, sessionId) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      const err = new Error('Phiên trò chuyện không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    await prisma.chatMessage.deleteMany({
      where: { sessionId }
    });

    return true;
  }

  /**
   * Xóa một phiên chat
   */
  static async deleteSession(userId, sessionId) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      const err = new Error('Phiên trò chuyện không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    await prisma.chatMessage.delete({
      where: { id: sessionId }
    });

    return true;
  }

  /**
   * Gửi tin nhắn và nhận câu trả lời tư vấn tài chính từ AI Providers hoặc Rule-based Fallback
   */
  static async sendMessage(userId, sessionId, content) {
    dotenv.config();

    // 1. Kiểm tra session thuộc về user
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId }
    });

    if (!session) {
      const err = new Error('Phiên trò chuyện không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    // 2. Lưu tin nhắn người dùng vào cơ sở dữ liệu
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: content.trim()
      }
    });

    // Cập nhật tiêu đề phiên chat nếu là tin nhắn đầu tiên
    const messageCount = await prisma.chatMessage.count({ where: { sessionId } });
    if (messageCount === 1) {
      const summaryTitle = content.length > 30 ? content.substring(0, 30) + '...' : content;
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: summaryTitle }
      });
    }

    // 3. Trích xuất ngữ cảnh tài chính thực tế của người dùng
    const financialContext = await ChatContextBuilder.buildFinancialContext(userId);

    // 4. Lấy lịch sử N tin nhắn gần nhất (tối đa 10 tin gần đây) để duy trì ngữ cảnh
    const recentDbMessages = await prisma.chatMessage.findMany({
      where: { sessionId },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    recentDbMessages.reverse();

    // 5. System Prompt chặt chẽ theo yêu cầu dự án (giữ nguyên quy tắc và format)
    const systemInstruction = `
Bạn là "Pocketly AI" - Trợ lý cố vấn tài chính cá nhân thông minh, thân thiện, mang phong cách Gen-Z hiện đại dành riêng cho sinh viên.

QUY TẮC BẮT BUỘC (STRICT RULES):
1. BẠN CHỈ ĐƯỢC PHÉP TRẢ LỜI VÀ TƯ VẤN VỀ TÀI CHÍNH CÁ NHÂN CỦA NGƯỜI DÙNG: Quản lý chi tiêu, ngân sách, tiết kiệm, thói quen tiêu tiền, các giao dịch và mục tiêu tài chính của họ.
2. NẾU NGƯỜI DÙNG HỎI CÁC CHỦ ĐỀ KHÔNG LIÊN QUAN (lập trình, giải bài tập, thời tiết, giải trí, chính trị, v.v.): Hãy lịch sự từ chối bằng giọng điệu trẻ trung, vui vẻ và hướng họ quay lại chủ đề quản lý tài chính sinh viên. Ví dụ: "Mình là trợ lý quản lý chi tiêu Pocketly, nên mình chỉ có thể giúp bạn kiểm soát ví tiền, ngân sách và thói quen tiêu dùng thôi nè! Bạn có muốn xem lại các khoản chi gần đây không?"
3. DỮ LIỆU CHÍNH XÁC & TUYỆT ĐỐI KHÔNG BỊA ĐẶT SỐ LIỆU (NEVER INVENT NUMBERS): Chỉ sử dụng các con số có trong phần [HỒ SƠ TÀI CHÍNH THỰC TẾ] được cung cấp bên dưới. Nếu không có thông tin, hãy nói rõ là chưa có dữ liệu giao dịch đó.
4. ĐƯA RA LỜI KHUYÊN THỰC TẾ CHO SINH VIÊN: Gợi ý các mẹo tiết kiệm thiết thực (tự nấu ăn thay vì ăn ngoài, săn voucher, sử dụng vé xe bus tháng, gom đồ Shopee chung bạn cùng phòng, đặt hạn mức cụ thể cho trà sữa/cà phê).
5. NGÔN NGỮ PHẢN HỒI: Luôn trả lời bằng chính ngôn ngữ mà người dùng sử dụng (nếu người dùng nhắn tiếng Việt thì trả lời tiếng Việt, tiếng Anh thì trả lời tiếng Anh).
6. TONE & GIỌNG ĐIỆU: Thân thiện, tôn trọng, đồng cảm với áp lực tài chính sinh viên, dùng câu từ gãy gọn, có cấu trúc bullet point rõ ràng.

DƯỚI ĐÂY LÀ DỮ LIỆU TÀI CHÍNH THỰC TẾ CỦA NGƯỜI DÙNG NÀY:
${financialContext}
`.trim();

    // Chuẩn bị danh sách messages cho các provider
    const messages = recentDbMessages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    // Đảm bảo tin nhắn hiện tại có mặt ở cuối
    if (messages.length === 0 || messages[messages.length - 1].content !== content.trim()) {
      messages.push({
        role: 'user',
        content: content.trim()
      });
    }

    // 6. Lựa chọn Primary Provider và Fallback Provider
    const configuredProvider = (process.env.AI_PROVIDER || config.aiProvider || 'gemini').toLowerCase().trim();
    const isGroqPrimary = configuredProvider === 'groq';

    const primary = isGroqPrimary
      ? { name: 'Groq', provider: GroqProvider }
      : { name: 'Gemini', provider: GeminiProvider };

    const secondary = isGroqPrimary
      ? { name: 'Gemini', provider: GeminiProvider }
      : { name: 'Groq', provider: GroqProvider };

    let assistantReply = '';
    let answeredBy = null;

    try {
      assistantReply = await primary.provider.generateReply(messages, systemInstruction);
      answeredBy = primary.name;
      console.log(`🤖 AI Provider answered: ${primary.name}`);
    } catch (primaryErr) {
      console.warn(`⚠️ [AI Provider] ${primary.name} gặp sự cố (${primaryErr.status || primaryErr.code || primaryErr.message}). Tự động chuyển đổi sang ${secondary.name}...`);
      try {
        assistantReply = await secondary.provider.generateReply(messages, systemInstruction);
        answeredBy = secondary.name;
        console.log(`🤖 AI Provider answered: ${secondary.name} (fallback from ${primary.name})`);
      } catch (secondaryErr) {
        console.warn(`⚠️ [AI Provider] Cả 2 nhà cung cấp (${primary.name} & ${secondary.name}) đều không khả dụng. Đang kích hoạt Rule-based Fallback trực tiếp từ cơ sở dữ liệu...`);
        assistantReply = await ChatContextBuilder.generateRuleBasedFallback(userId, content);
        answeredBy = 'Rule-based fallback';
        console.log('🤖 AI Provider answered: Rule-based fallback');
      }
    }

    // 7. Lưu câu trả lời của trợ lý vào database
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: assistantReply
      }
    });

    // Cập nhật updatedAt của session
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    return {
      userMessage,
      assistantMessage,
      answeredBy
    };
  }
}
