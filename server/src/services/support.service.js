import { prisma } from '../config/prisma.js';

export class SupportService {
  /**
   * Tự động khởi tạo bảng support_tickets nếu chưa tồn tại
   */
  static async ensureTable() {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "fullName" TEXT NOT NULL,
          email TEXT NOT NULL,
          topic TEXT NOT NULL DEFAULT 'general',
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          notes TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status, "createdAt" DESC)
      `);
    } catch (error) {
      console.error('❌ Lỗi khởi tạo bảng support_tickets:', error);
      throw error;
    }
  }

  /**
   * Tạo yêu cầu hỗ trợ mới từ người dùng (Public)
   */
  static async createTicket({ fullName, email, topic = 'general', message }) {
    await this.ensureTable();

    if (!fullName || !email || !message) {
      const err = new Error('Họ tên, email và nội dung không được để trống');
      err.statusCode = 400;
      throw err;
    }

    const rows = await prisma.$queryRawUnsafe(
      `INSERT INTO support_tickets ("fullName", email, topic, message, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, "fullName", email, topic, message, status, "createdAt", "updatedAt"`,
      fullName.trim(),
      email.trim().toLowerCase(),
      topic.trim(),
      message.trim()
    );

    return rows[0];
  }

  /**
   * Lấy danh sách các yêu cầu hỗ trợ (Dành cho Admin)
   */
  static async listTickets({ status, topic, search, page = 1, limit = 10 }) {
    await this.ensureTable();

    const offset = (Number(page) - 1) * Number(limit);
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'ALL') {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (topic && topic !== 'ALL') {
      whereConditions.push(`topic = $${paramIndex}`);
      params.push(topic);
      paramIndex++;
    }

    if (search && search.trim()) {
      whereConditions.push(
        `("fullName" ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR message ILIKE $${paramIndex})`
      );
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Lấy danh sách tickets
    const querySql = `
      SELECT id, "fullName", email, topic, message, status, notes, "createdAt", "updatedAt"
      FROM support_tickets
      ${whereClause}
      ORDER BY "createdAt" DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    // Đếm tổng số lượng theo điều kiện lọc
    const countSql = `SELECT count(*)::int as total FROM support_tickets ${whereClause}`;

    const [tickets, countResult, statsResult] = await Promise.all([
      prisma.$queryRawUnsafe(querySql, ...params),
      prisma.$queryRawUnsafe(countSql, ...params),
      prisma.$queryRawUnsafe(`
        SELECT 
          count(*)::int as total,
          count(*) FILTER (WHERE status = 'PENDING')::int as pending,
          count(*) FILTER (WHERE status = 'IN_PROGRESS')::int as in_progress,
          count(*) FILTER (WHERE status = 'RESOLVED')::int as resolved
        FROM support_tickets
      `)
    ]);

    const total = countResult[0]?.total || 0;
    const stats = statsResult[0] || { total: 0, pending: 0, in_progress: 0, resolved: 0 };

    return {
      tickets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1
      },
      stats
    };
  }

  /**
   * Cập nhật trạng thái hoặc ghi chú cho yêu cầu (Dành cho Admin)
   */
  static async updateTicket(id, { status, notes }) {
    await this.ensureTable();

    const updates = [];
    const params = [];
    let paramIdx = 1;

    if (status) {
      updates.push(`status = $${paramIdx}`);
      params.push(status);
      paramIdx++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIdx}`);
      params.push(notes);
      paramIdx++;
    }

    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    params.push(id);

    const updateSql = `
      UPDATE support_tickets
      SET ${updates.join(', ')}
      WHERE id = $${paramIdx}::uuid
      RETURNING id, "fullName", email, topic, message, status, notes, "createdAt", "updatedAt"
    `;

    const rows = await prisma.$queryRawUnsafe(updateSql, ...params);
    if (!rows || rows.length === 0) {
      const err = new Error('Yêu cầu hỗ trợ không tồn tại');
      err.statusCode = 404;
      throw err;
    }

    return rows[0];
  }

  /**
   * Xóa một yêu cầu hỗ trợ (Dành cho Admin)
   */
  static async deleteTicket(id) {
    await this.ensureTable();

    await prisma.$executeRawUnsafe(
      `DELETE FROM support_tickets WHERE id = $1::uuid`,
      id
    );

    return true;
  }
}
