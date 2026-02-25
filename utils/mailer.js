const nodemailer = require('nodemailer');

/* ✅ สร้าง transporter */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/* (แนะนำ) เช็กตั้งแต่ตอน server start */
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Mail transporter error:', err);
  } else {
    console.log('✅ Mail transporter ready');
  }
});

async function sendOTP(email, otp) {
  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0;padding:0;background:#f3e8ff;font-family:'Kanit',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:20px;box-shadow:0 20px 40px rgba(124,58,237,.15);overflow:hidden;">

    <div style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;padding:24px;text-align:center;">
      <h1 style="margin:0;font-size:22px;">🎓 Assignment System</h1>
      <p style="margin:4px 0 0;font-size:14px;opacity:.9;">วิทยาลัยเทคนิคสมุทรปราการ</p>
    </div>

    <div style="padding:32px;color:#333;">
      <h2 style="color:#7c3aed;margin-top:0;">ยืนยันอีเมลของคุณ</h2>
      <p>กรุณานำรหัส OTP ด้านล่างไปกรอกในระบบ</p>

      <div style="margin:24px 0;text-align:center;">
        <div style="display:inline-block;font-size:36px;font-weight:700;letter-spacing:8px;padding:16px 32px;background:#f3e8ff;color:#7c3aed;border-radius:16px;">
          ${otp}
        </div>
      </div>

      <p style="font-size:14px;color:#555;">
        ⏱️ ใช้ได้ภายใน <b>5 นาที</b>
      </p>
    </div>

    <div style="background:#fafafa;padding:16px;text-align:center;font-size:12px;color:#999;">
      Assignment System © ${new Date().getFullYear()}
    </div>

  </div>
</body>
</html>
`;

  console.log('📨 Sending OTP:', email, otp);

  await transporter.sendMail({
    from: `"Assignment System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: '🔐 รหัส OTP สำหรับยืนยันตัวตน',
    html
  });
}

module.exports = { sendOTP };
