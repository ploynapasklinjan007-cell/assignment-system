async function uploadAvatar(input) {
  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('กรุณาเลือกไฟล์รูปภาพ');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('ไฟล์ต้องไม่เกิน 2MB');
    return;
  }

  const reader = new FileReader();

  reader.onloadstart = () => {
    document.body.classList.add('opacity-70');
  };

reader.onload = async () => {
  if (!currentUser) {
    alert('กรุณาเข้าสู่ระบบใหม่');
    return;
  }

  const oldAvatar = currentUser.avatar; // ⭐ เก็บของเดิมไว้
  currentUser.avatar = reader.result;

  const result = await window.dataSdk.update(currentUser);
  if (!result?.isOk) {
    currentUser.avatar = oldAvatar; // ⭐ rollback
    alert('อัปโหลดรูปไม่สำเร็จ');
    return;
  }

  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  updateUserDisplay();

  if (currentView === 'profile' || currentView === 'teacherprofile') {
    renderCurrentView();
  }

  showSuccessModal(
    'อัปเดตรูปโปรไฟล์',
    'เปลี่ยนรูปเรียบร้อยแล้ว 🎉'
  );
};

  reader.onloadend = () => {
    document.body.classList.remove('opacity-70');
  };

  reader.readAsDataURL(file);
}

window.uploadAvatar = uploadAvatar;
