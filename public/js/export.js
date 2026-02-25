function exportPDF(type) {
  showSuccessModal('กำลังสร้าง PDF', 'ระบบกำลังสร้างรายงาน...');

  if (type === 'students') {
    window.open('/api/pdf/students', '_blank');
  }

  if (type === 'submissions') {
    window.open('/api/pdf/submissions', '_blank');
  }
}
