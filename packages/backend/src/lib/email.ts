/**
 * Email Service
 * Send emails using Nodemailer
 */

import { createTransport } from 'nodemailer'
import { env } from './env'

// Create transporter
export const transporter = createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
})

// Verify connection (silent fail - don't crash app)
transporter.verify().then(() => {
  console.log('✅ Email service ready')
}).catch(() => {
  // Silently ignore email service errors
  // Email will fail gracefully when needed
})

/**
 * Send OTP email
 */
export async function sendOTPEmail(to: string, otp: string, name?: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .otp-box { background: white; border: 2px dashed #FF6B35; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 32px; font-weight: bold; color: #FF6B35; letter-spacing: 8px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Phường Xã Của Tôi</h1>
      <p>Xác Thực Tài Khoản</p>
    </div>
    <div class="content">
      <p>Xin chào ${name || 'bạn'},</p>
      <p>Mã OTP của bạn để đăng nhập vào hệ thống quản trị:</p>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
      </div>

      <p><strong>Lưu ý:</strong></p>
      <ul>
        <li>Mã OTP có hiệu lực trong ${env.OTP_EXPIRY / 60} phút</li>
        <li>Không chia sẻ mã này với bất kỳ ai</li>
        <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email</li>
      </ul>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Phường Xã Của Tôi. All rights reserved.</p>
      <p>Email tự động, vui lòng không trả lời.</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: `Mã OTP đăng nhập - ${otp}`,
    html,
  })
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Chào mừng đến với Phường Xã Của Tôi!</h1>
    </div>
    <div class="content">
      <p>Xin chào ${name},</p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Tài khoản của bạn đã được tạo thành công!</p>
      <p>Bạn có thể bắt đầu sử dụng các tính năng của hệ thống ngay bây giờ.</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'Chào mừng đến với Phường Xã Của Tôi',
    html,
  })
}

/**
 * Send feedback response email
 */
export async function sendFeedbackResponseEmail(
  to: string,
  feedbackTitle: string,
  response: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .response-box { background: white; border-left: 4px solid #10B981; padding: 15px; margin: 15px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Phản Hồi Từ Phường/Xã</h1>
    </div>
    <div class="content">
      <p>Phản ánh của bạn: <strong>${feedbackTitle}</strong></p>
      <p>Chúng tôi đã có phản hồi cho phản ánh của bạn:</p>
      <div class="response-box">
        ${response}
      </div>
      <p>Cảm ơn bạn đã đóng góp ý kiến!</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: `Phản hồi: ${feedbackTitle}`,
    html,
  })
}
