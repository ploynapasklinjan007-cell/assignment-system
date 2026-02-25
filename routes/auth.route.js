const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { sendOTP } = require('../utils/mailer');

const otpStore = new Map();

/* ================= SEND OTP ================= */
router.post('/send-otp', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: 'กรุณาระบุอีเมล' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  await sendOTP(email, otp);
  res.json({ message: 'OTP sent' });
});

/* ================= VERIFY OTP ================= */
router.post('/verify-otp', (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const otp = req.body.otp;

  const record = otpStore.get(email);

  if (!record) {
    return res.status(400).json({ message: 'ยังไม่ได้ขอรหัส OTP' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'รหัส OTP ไม่ถูกต้อง' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP หมดอายุ' });
  }

  otpStore.delete(email);

  const user = {
    id: email,
    role: 'student',
    email
  };

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'OTP ถูกต้อง',
    token
  });
});

module.exports = router;
