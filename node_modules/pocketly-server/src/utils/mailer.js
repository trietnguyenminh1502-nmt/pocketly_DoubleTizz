import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Tạo transporter dùng SMTP thật (Gmail) từ biến môi trường
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // smtp.gmail.com
  port: Number(process.env.SMTP_PORT), // 587
  secure: process.env.SMTP_SECURE === 'true', // false cho port 587
  auth: {
    user: process.env.SMTP_USER,     // trietnguyenminh1502@gmail.com
    pass: process.env.SMTP_PASS      // app password
  }
});

// Kiểm tra kết nối khi khởi động
transporter.verify((error) => {
  if (error) {
    console.error('❌ Lỗi kết nối SMTP:', error.message);
  } else {
    console.info('✅ SMTP mailer sẵn sàng gửi email thật!');
  }
});

export const sendVerificationEmail = async ({ to, fullName, token }) => {
  try {
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const info = await transporter.sendMail({
      from: `"Pocketly 🌿" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Xác thực tài khoản Pocketly của bạn',
      html: `
        <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #E8E2D6; border-radius: 16px; background-color: #F6F2EA;">
          <h2 style="color: #123D2F;">Chào ${fullName}! 🌿</h2>
          <p style="color: #16211C; font-size: 15px;">Cảm ơn bạn đã đăng ký tài khoản Pocketly - Ứng dụng quản lý tài chính sinh viên thông minh.</p>
          <p style="color: #16211C; font-size: 15px;">Vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${verifyUrl}" style="background-color: #123D2F; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">
              Xác thực email ngay
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">Hoặc copy đường link này vào trình duyệt:<br/><a href="${verifyUrl}" style="color: #FF6A2B;">${verifyUrl}</a></p>
          <p style="color: #aaa; font-size: 12px; margin-top: 24px;">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email.</p>
        </div>
      `
    });

    console.info(`\n📧 [VERIFICATION EMAIL SENT]`);
    console.info(`To: ${to}`);
    console.info(`MessageId: ${info.messageId}\n`);

    return { messageId: info.messageId };
  } catch (error) {
    console.error('❌ Lỗi khi gửi email xác thực:', error.message);
  }
};

export const sendPasswordResetEmail = async ({ to, fullName, token }) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const info = await transporter.sendMail({
      from: `"Pocketly 🌿" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Yêu cầu đặt lại mật khẩu Pocketly',
      html: `
        <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #E8E2D6; border-radius: 16px; background-color: #F6F2EA;">
          <h2 style="color: #123D2F;">Yêu cầu đặt lại mật khẩu</h2>
          <p style="color: #16211C; font-size: 15px;">Xin chào <strong>${fullName}</strong>, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Pocketly của bạn.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #FF6A2B; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">Liên kết này có hiệu lực trong <strong>1 giờ</strong>.</p>
          <p style="color: #666; font-size: 13px;">Link: <a href="${resetUrl}" style="color: #FF6A2B;">${resetUrl}</a></p>
          <p style="color: #aaa; font-size: 12px; margin-top: 24px;">Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email và mật khẩu của bạn sẽ không thay đổi.</p>
        </div>
      `
    });

    console.info(`\n📧 [PASSWORD RESET EMAIL SENT]`);
    console.info(`To: ${to}`);
    console.info(`MessageId: ${info.messageId}\n`);

    return { messageId: info.messageId };
  } catch (error) {
    console.error('❌ Lỗi khi gửi email reset password:', error.message);
  }
};
