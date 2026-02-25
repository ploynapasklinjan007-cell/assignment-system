const PDFDocument = require('pdfkit');

exports.generateStudentPDF = (students, res) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="students.pdf"'
  );

  doc.pipe(res);

  // ฟอนต์ไทย (สำคัญมาก)
  doc.font('fonts/Kanit-Regular.ttf');

  doc.fontSize(18).text('รายชื่อนักเรียน', { align: 'center' });
  doc.moveDown();

  students.forEach((s, i) => {
    doc
      .fontSize(12)
      .text(`${i + 1}. ${s.name} ${s.surname}`, {
        lineGap: 6
      });
  });

  doc.end();
};
