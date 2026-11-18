import app from './app.js';
import { config } from './config/index.js';
import { prisma } from './config/prisma.js';

const startServer = async () => {
  try {
    // Verify database connection on startup
    await prisma.$connect();
    console.info('✅ Kết nối cơ sở dữ liệu PostgreSQL thành công.');

    // Tự động sửa tên người dùng nếu bị lỗi font mã hóa dấu '?'
    await prisma.user.updateMany({
      where: {
        email: 'user1@pocketly.com',
        fullName: { contains: '?' }
      },
      data: {
        fullName: 'Nguyễn Minh Triết'
      }
    });
    await prisma.user.updateMany({
      where: {
        email: 'user2@pocketly.com',
        fullName: { contains: '?' }
      },
      data: {
        fullName: 'Trần Phương Thảo'
      }
    });
    await prisma.user.updateMany({
      where: {
        email: 'admin@pocketly.com',
        fullName: { contains: '?' }
      },
      data: {
        fullName: 'Quản Trị Viên Pocketly'
      }
    });

    // Tự động sửa tiêu đề phiên chat nếu bị lỗi dấu '?'
    const brokenSessions = await prisma.chatSession.findMany({
      where: {
        title: { contains: '?' }
      }
    });
    for (const s of brokenSessions) {
      await prisma.chatSession.update({
        where: { id: s.id },
        data: {
          title: s.title
            .replace(/Th\?ng n\?y m\?nh ti\?u nhi\?u/gi, 'Tháng này mình tiêu nhiều')
            .replace(/\?/g, '')
            .trim() || 'Phiên tư vấn'
        }
      });
    }

    const server = app.listen(config.port, () => {
      console.info(`🌿 Pocketly Server đang chạy tại http://localhost:${config.port}`);
      console.info(`📡 Health check: http://localhost:${config.port}/api/v1/health`);
    });

    const shutdown = async (signal) => {
      console.info(`\nNhận tín hiệu ${signal}. Đang dừng server...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.info('🛑 Server và kết nối database đã đóng an toàn.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
