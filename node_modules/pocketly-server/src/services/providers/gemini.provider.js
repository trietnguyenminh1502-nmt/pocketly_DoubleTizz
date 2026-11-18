import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { config } from '../../config/index.js';

export class GeminiProvider {
  /**
   * Tạo câu trả lời từ Google Gemini
   * @param {Array<{role: string, content: string}>} messages Danh sách tin nhắn
   * @param {string} systemPrompt Lời nhắc hệ thống (System Prompt)
   * @returns {Promise<string>}
   */
  static async generateReply(messages, systemPrompt) {
    dotenv.config();
    const apiKey = (process.env.GEMINI_API_KEY || config.gemini?.apiKey || '').trim();
    if (!apiKey) {
      const err = new Error('GEMINI_API_KEY chưa được cấu hình');
      err.status = 401;
      throw err;
    }

    const model = (process.env.GEMINI_MODEL || config.gemini?.model || 'gemini-2.5-flash').trim();
    const timeoutMs = Number.parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || config.gemini?.timeoutMs || 60000;

    const ai = new GoogleGenAI({ apiKey });

    // Định dạng nội dung phù hợp với Gemini API (vai trò model/user)
    const rawContents = (messages || []).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: (msg.content || '').trim() }]
    }));

    // Gộp các lượt nhắn liên tiếp có cùng vai trò
    const normalizedContents = [];
    for (const item of rawContents) {
      if (!item.parts[0]?.text) continue;
      const last = normalizedContents[normalizedContents.length - 1];
      if (last && last.role === item.role) {
        last.parts[0].text += '\n' + item.parts[0].text;
      } else {
        normalizedContents.push({
          role: item.role,
          parts: [{ text: item.parts[0].text }]
        });
      }
    }

    // Đảm bảo lượt bắt đầu luôn là 'user'
    while (normalizedContents.length > 0 && normalizedContents[0].role !== 'user') {
      normalizedContents.shift();
    }

    if (normalizedContents.length === 0) {
      throw new Error('Nội dung tin nhắn gửi tới Gemini rỗng');
    }

    let timeoutId;
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: normalizedContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        }),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            const timeoutErr = new Error(`Gemini request timeout sau ${timeoutMs}ms`);
            timeoutErr.status = 408;
            timeoutErr.code = 'ETIMEDOUT';
            reject(timeoutErr);
          }, timeoutMs);
        })
      ]);

      const reply = response.text;
      if (!reply) {
        throw new Error('Gemini trả về phản hồi rỗng');
      }
      return reply;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  async generateReply(messages, systemPrompt) {
    return GeminiProvider.generateReply(messages, systemPrompt);
  }
}
