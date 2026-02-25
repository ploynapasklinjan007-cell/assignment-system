const express = require('express');
const PDFDocument = require('pdfkit');

const router = express.Router();

/**
 * GET /api/pdf/students
 * สร้าง PDF รายชื่อนักเรียน (ตัวอย่าง)
 */
router.get('/students', (req, res) => {
  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="students.pdf"');

  doc.pipe(res);

  doc.fontSize(18).text('รายชื่อนักเรียน\n\n');

  // mock data ชั่วคราว (ยังไม่ต่อ DB)
  const students = [
    { name: 'สมชาย ใจดี' },
    { name: 'สมหญิง ตั้งใจเรียน' },
    { name: 'วิชัย ขยันมาก' }
  ];

  students.forEach((s, i) => {
    doc.fontSize(12).text(`${i + 1}. ${s.name}`);
  });

  doc.end();
});

module.exports = router;