import nodemailer from 'nodemailer';

let testAccount = null;
let transporter = null;

const getTransporter = async () => {
  if (!transporter) {
    // Tạo Ethereal test account tự động nếu chưa có
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.info(`📧 Ethereal mailer initialized with test account: ${testAccount.user}`);
  }
  return transporter;
};

export const sendVerificationEmail = async ({ to, fullName, token }) => {
  try {
    const mailer = await getTransporter();
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const info = await mailer.sendMail({
      from: '"Pocketly 🌿" <no-reply@pocketly.com>',
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
        </div>
      `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.info(`\n📧 [EMAIL VERIFICATION PREVIEW]`);
    console.info(`To: ${to}`);
    console.info(`🔗 Preview Link: ${previewUrl}`);
    console.info(`🔑 Verification Token: ${token}\n`);

    return { previewUrl, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Lỗi khi gửi email xác thực:', error);
  }
};

export const sendPasswordResetEmail = async ({ to, fullName, token }) => {
  try {
    const mailer = await getTransporter();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const info = await mailer.sendMail({
      from: '"Pocketly 🌿" <no-reply@pocketly.com>',
      to,
      subject: 'Yêu cầu đặt lại mật khẩu Pocketly',
      html: `
        <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #E8E2D6; border-radius: 16px; background-color: #F6F2EA;">
          <h2 style="color: #123D2F;">Yêu cầu đặt lại mật khẩu</h2>
          <p style="color: #16211C; font-size: 15px;">Xin chào ${fullName}, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Pocketly của bạn.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #FF6A2B; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">Liên kết này có hiệu lực trong 1 giờ. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email.</p>
          <p style="color: #666; font-size: 13px;">Link: <a href="${resetUrl}" style="color: #FF6A2B;">${resetUrl}</a></p>
        </div>
      `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.info(`\n📧 [PASSWORD RESET EMAIL PREVIEW]`);
    console.info(`To: ${to}`);
    console.info(`🔗 Preview Link: ${previewUrl}`);
    console.info(`🔑 Reset Token: ${token}\n`);

    return { previewUrl, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Lỗi khi gửi email reset password:', error);
  }
};
