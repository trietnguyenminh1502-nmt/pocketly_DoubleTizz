import dotenv from 'dotenv';
import { config } from '../../config/index.js';

export class GroqProvider {
  /**
   * Tạo câu trả lời từ Groq API (OpenAI-compatible)
   * @param {Array<{role: string, content: string}>} messages Danh sách tin nhắn
   * @param {string} systemPrompt Lời nhắc hệ thống (System Prompt)
   * @returns {Promise<string>}
   */
  static async generateReply(messages, systemPrompt) {
    dotenv.config();
    const apiKey = (process.env.GROQ_API_KEY || config.groq?.apiKey || '').trim();
    if (!apiKey) {
      const err = new Error('GROQ_API_KEY chưa được cấu hình');
      err.status = 401;
      throw err;
    }

    const model = (process.env.GROQ_MODEL || config.groq?.model || 'llama-3.3-70b-versatile').trim();
    const timeoutMs = Number.parseInt(process.env.GROQ_TIMEOUT_MS, 10) || config.groq?.timeoutMs || 60000;

    const groqMessages = [];
    if (systemPrompt && systemPrompt.trim()) {
      groqMessages.push({
        role: 'system',
        content: systemPrompt.trim()
      });
    }

    for (const msg of messages || []) {
      const content = (msg.content || '').trim();
      if (!content) continue;
      groqMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content
      });
    }

    if (groqMessages.length === 0 || (groqMessages.length === 1 && groqMessages[0].role === 'system')) {
      throw new Error('Nội dung tin nhắn gửi tới Groq rỗng');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 1000
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let parsedError;
        try {
          parsedError = JSON.parse(errorText);
        } catch {
          parsedError = null;
        }

        const message = parsedError?.error?.message || errorText || response.statusText;

        // Nếu model không tồn tại (404), tự động thử với model tương thích có sẵn trên Groq
        if (response.status === 404 && model !== 'openai/gpt-oss-120b') {
          console.warn(`[GroqProvider] Model ${model} không tìm thấy (404), đang tự động chuyển sang openai/gpt-oss-120b...`);
          const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'openai/gpt-oss-120b',
              messages: groqMessages,
              temperature: 0.7,
              max_tokens: 1000
            }),
            signal: controller.signal
          });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            const fallbackReply = fallbackData.choices?.[0]?.message?.content?.trim();
            if (fallbackReply) return fallbackReply;
          }
        }

        const error = new Error(`Groq API trả về mã lỗi ${response.status}: ${message}`);
        error.status = response.status;
        error.response = { status: response.status, data: errorText };
        throw error;
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        throw new Error('Groq trả về phản hồi rỗng');
      }
      return reply;
    } catch (err) {
      if (err.name === 'AbortError') {
        const timeoutErr = new Error(`Groq request timeout sau ${timeoutMs}ms`);
        timeoutErr.status = 408;
        timeoutErr.code = 'ETIMEDOUT';
        throw timeoutErr;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generateReply(messages, systemPrompt) {
    return GroqProvider.generateReply(messages, systemPrompt);
  }
}
