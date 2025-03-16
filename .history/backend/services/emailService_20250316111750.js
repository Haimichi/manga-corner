const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      }
    });
  }

  async sendNewChapterNotification(user, manga, chapter) {
    const mailOptions = {
      from: 'MangaCorner <noreply@mangacorner.com>',
      to: user.email,
      subject: `Chương mới: ${manga.title.en || manga.title.vi}`,
      html: `
        <h1>Chương mới đã được phát hành!</h1>
        <p>Xin chào ${user.username},</p>
        <p>Manga "${manga.title.en || manga.title.vi}" vừa có chương mới:</p>
        <ul>
          <li>Chương: ${chapter.chapter}</li>
          <li>Tiêu đề: ${chapter.title || 'Không có tiêu đề'}</li>
          <li>Nhóm dịch: ${chapter.scanlationGroup?.name || 'Không có thông tin'}</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/manga/${manga.id}/chapter/${chapter.id}">
          Đọc ngay
        </a>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationOTP(user, otp) {
    const mailOptions = {
      from: 'MangaCorner <noreply@mangacorner.com>',
      to: user.email,
      subject: 'Mã OTP xác nhận tài khoản',
      html: `
        <h1>Xác nhận tài khoản</h1>
        <p>Xin chào ${user.username},</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại MangaCorner. Vui lòng sử dụng mã OTP bên dưới để xác nhận email của bạn:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
          ${otp}
        </div>
        <p>Mã OTP này sẽ hết hạn sau 10 phút.</p>
        <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordReset(user, resetToken) {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: 'MangaCorner <noreply@mangacorner.com>',
      to: user.email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <h1>Yêu cầu đặt lại mật khẩu</h1>
        <p>Xin chào ${user.username},</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Click vào link bên dưới để tiếp tục:</p>
        <a href="${resetURL}">Đặt lại mật khẩu</a>
        <p>Link này sẽ hết hạn sau 10 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();