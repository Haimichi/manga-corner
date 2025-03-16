const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  constructor() {
    // Kiểm tra và log thông tin cấu hình
    console.log('Initializing email service with config:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER ? '****' : 'Missing',
      pass: process.env.EMAIL_PASS ? '****' : 'Missing',
    });
    
    // Tạo transporter với debug mode bật
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true, // Bật debug mode
      logger: true  // Bật logger
    });
    
    // Xác minh connection
    this.verifyConnection();
  }
  
  // Phương thức xác minh kết nối
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connected successfully!');
    } catch (error) {
      console.error('Email service connection failed:', error);
      // Không throw error ở đây để tránh việc app không khởi động được
    }
  }

  async sendNewChapterNotification(user, manga, chapter) {
    const mailOptions = {
      from: `"MangaCorner" <${config.EMAIL_USER}>`,
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

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email thông báo chương mới đã gửi:', info.messageId);
      return info;
    } catch (error) {
      console.error('Lỗi gửi email thông báo:', error);
      throw error;
    }
  }

  async sendVerificationOTP(user, otp) {
    // Kiểm tra đầu vào
    if (!user || !user.email) {
      console.error('Error: Invalid recipient email', user);
      throw new Error('Invalid recipient email');
    }
    
    console.log(`Preparing to send OTP ${otp} to ${user.email}`);
    
    // Chuẩn bị mailOptions
    const mailOptions = {
      from: `"MangaCorner" <${process.env.EMAIL_USER || 'noreply@mangacorner.com'}>`,
      to: user.email,
      subject: 'Mã OTP xác nhận tài khoản',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
          <h2>Mã OTP của bạn</h2>
          <div style="background-color: #f5f5f5; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">${otp}</div>
          <p>Mã này sẽ hết hạn sau 10 phút.</p>
        </div>
      `
    };

    console.log('Mail options prepared:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    try {
      // Gửi email thực sự
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send email:', error);
      
      // Log chi tiết hơn
      if (error.code === 'EAUTH') {
        console.error('Authentication error. Check your email credentials.');
      } else if (error.code === 'ESOCKET') {
        console.error('Socket error. Check your email host and port settings.');
      }
      
      throw error;
    }
  }

  async sendPasswordReset(user, resetToken) {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"MangaCorner" <${config.EMAIL_USER}>`,
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

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email đặt lại mật khẩu đã gửi:', info.messageId);
      return info;
    } catch (error) {
      console.error('Lỗi gửi email đặt lại mật khẩu:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();