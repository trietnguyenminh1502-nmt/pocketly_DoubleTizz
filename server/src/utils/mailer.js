import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
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

export const sendOtpEmail = async ({ to, fullName, otp }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Pocketly 🌿" <${process.env.SMTP_USER}>`,
      to,
      subject: `[Pocketly] Mã xác thực tài khoản của bạn: ${otp}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; border: 1px solid #E8E2D6; border-radius: 20px; background-color: #F6F2EA;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 28px; font-weight: 800; color: #123D2F; letter-spacing: -0.5px;">🌿 Pocketly</span>
          </div>
          <h2 style="color: #123D2F; font-size: 20px; margin-bottom: 12px;">Chào ${fullName || 'bạn'}!</h2>
          <p style="color: #16211C; font-size: 15px; line-height: 1.6;">
            Cảm ơn bạn đã đăng ký tài khoản tại <strong>Pocketly</strong>. Để hoàn tất đăng ký, vui lòng nhập mã xác thực 6 số bên dưới:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #123D2F; background: #FFFFFF; padding: 14px 28px; border-radius: 14px; border: 2px dashed #D4F05A; font-family: monospace;">
              ${otp}
            </span>
          </div>
          <p style="color: #5C6B64; font-size: 13px; line-height: 1.5; margin-bottom: 8px;">
            ⏱ Mã xác thực này có hiệu lực trong vòng <strong>10 phút</strong>.
          </p>
          <p style="color: #888; font-size: 12px; margin-top: 24px; border-top: 1px solid #E0D9CC; padding-top: 16px;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với chúng tôi để được trợ giúp.
          </p>
        </div>
      `
    });

    console.info(`\n📧 [OTP EMAIL SENT] To: ${to} | Code: ${otp} | MessageId: ${info.messageId}\n`);
    return { messageId: info.messageId };
  } catch (error) {
    console.error('❌ Lỗi khi gửi email OTP:', error.message);
    throw error;
  }
};
