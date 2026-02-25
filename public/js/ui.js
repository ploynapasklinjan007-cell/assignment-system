function hideAllModals(exceptId = null) {
  document.querySelectorAll('.modal-overlay').forEach(el => {
    if (el.id === exceptId) return;

    el.classList.remove('active');
    el.classList.add('hidden');
    el.style.pointerEvents = 'none';
    el.style.zIndex = '-1';
  });
}

function entermainApp() {
  if (!currentUser) return;

  hideAllModals();

  const landingPage = document.getElementById('landingPage');
  const mainApp = document.getElementById('mainApp');

  // ✅ ซ่อน landingPage อย่างถูกต้อง
  if (landingPage) {
    landingPage.style.display = 'none';
  }

  // ✅ เปิด mainApp
  if (mainApp) {
    mainApp.classList.remove('hidden');   // Tailwind hidden = display:none
    mainApp.style.display = 'flex';
    mainApp.style.minHeight = '100vh';
  }

  document.body.classList.remove('overflow-hidden');

  if (!currentView) currentView = 'assignments';

  requestAnimationFrame(() => {
    updateUserDisplay();
    renderSidebar();
    renderCurrentView();

    console.log(
      'mainApp height:',
      document.getElementById('mainApp').getBoundingClientRect().height
    );
    console.log(
      'mainContent height:',
      document.getElementById('mainContent').getBoundingClientRect().height
    );
  });
}

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.remove('hidden');
  el.classList.add('active');
  el.style.display = 'flex';
  el.style.pointerEvents = 'auto';
  el.style.zIndex = '50';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.remove('active');
  el.classList.add('hidden');
  el.style.pointerEvents = 'none';
  el.style.zIndex = '-1';
}

function showLandingPage() {
  const landingPage = document.getElementById('landingPage');
  const mainApp = document.getElementById('mainApp');

  hideAllModals();

  if (mainApp) {
    mainApp.style.display = 'none';
  }

  if (landingPage) {
    landingPage.style.display = 'flex';
    landingPage.style.pointerEvents = 'auto';
  }

  document.body.classList.add('overflow-hidden');
}

function showHelpModal() {
  hideAllModals();
  openModal('helpModal');
}

function hideHelpModal() {
  closeModal('helpModal');
}

function showLogoutModal() {
  hideAllModals('logoutModal');
  openModal('logoutModal');
}

function hideLogoutModal() {
  closeModal('logoutModal');
}

function showSuccessModal(title, message) {
  document.getElementById('successTitle').textContent = title;
  document.getElementById('successMessage').textContent = message;
  openModal('successModal');

  if (typeof triggerConfetti === 'function') {
    triggerConfetti();
  }
}

function hideSuccessModal() {
  closeModal('successModal');
}

function confirmLogout() {
  document.body.style.overflow = '';
  currentUser = null;
  selectedRole = null;
  currentView = 'assignments';
  localStorage.removeItem('currentUser');

  hideAllModals();
  hideLogoutModal();

  showLandingPage(); // ⭐ ใช้ตัวนี้แทน
}

        function changeTheme(theme) {
      const body = document.body;
      body.classList.remove('theme-pastel', 'theme-dark', 'theme-blue', 'theme-green', 'theme-sunset', 'theme-rose', 'theme-purple', 'theme-ocean');
      body.classList.add(`theme-${theme}`);
    }

        function renderSidebar() {
      const nav = document.getElementById('sidebarNav');
      if (!nav || !currentUser) return;
      const isTeacher = currentUser.role === 'teacher';
      
      const items = isTeacher ? [
        { id: 'assignments', icon: '📚', label: 'งานทั้งหมด' },
        { id: 'create', icon: '➕', label: 'สร้างงานใหม่' },
        {id: 'reuse',label: 'ใช้ซ้ำจากงานเดิม',icon: '📋'},
        { id: 'submissions', icon: '📥', label: 'รายการส่งงาน' },
        { id: 'students', icon: '👥', label: 'จัดการนักเรียน' },
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'heatmap', icon: '🗓️', label: 'Heatmap' },
        { id: 'rubric', icon: '📋', label: 'Rubric Template' },
        { id: 'export', icon: '📄', label: 'ส่งออก PDF' },
        { id: 'teacherprofile', icon: '👤', label: 'โปรไฟล์' }
      ] : [
        { id: 'assignments', icon: '📚', label: 'งานทั้งหมด' },
        { id: 'mysubmissions', icon: '✅', label: 'งานที่ส่งแล้ว' },
        { id: 'calendar', icon: '📅', label: 'ปฏิทิน' },
        { id: 'profile', icon: '👤', label: 'โปรไฟล์' }
      ];
      
      nav.innerHTML = items.map(item => `
        <button onclick="switchView('${item.id}')" class="sidebar-item w-full px-4 py-3 text-left flex items-center gap-3 text-main ${currentView === item.id ? 'active' : ''}">
          <span class="text-lg">${item.icon}</span>
          <span class="text-sm font-medium">${item.label}</span>
        </button>
      `).join('');
    }

function switchView(view) {
  if (!currentUser) {
    console.warn('switchView blocked: no currentUser');
    return;
  }

  hideAllModals();

  const isSameView = currentView === view;
  currentView = view;

  renderSidebar();

  requestAnimationFrame(() => {
    renderCurrentView();
  });
}

function showmainApp() {
  // 🔁 ใช้ logic ใหม่ทั้งหมด
  entermainApp();
}

function renderCurrentView() {
    const mainApp = document.getElementById('mainApp');
  if (!mainApp) {
    console.warn('⏳ render blocked: mainApp not ready');
    return;
  }
  const content = document.getElementById('mainContent');
if (!content) {
  console.error('❌ mainContent not found');
  return;
}
content.innerHTML = '';

  try {
    if (currentView === 'assignments' && typeof renderAssignments === 'function') {
      renderAssignments();

    } else if (currentView === 'create' && typeof renderCreateAssignment === 'function') {
      renderCreateAssignment();

    } else if (currentView === 'reuse' && typeof renderReuseAssignments === 'function') {
      renderReuseAssignments();

    } else if (currentView === 'submissions' && typeof renderTeacherMySubmissions === 'function') {
      renderTeacherMySubmissions();

    } else if (currentView === 'students' && typeof renderStudents === 'function') {
      renderStudents();

    } else if (currentView === 'dashboard' && typeof renderDashboard === 'function') {
      renderDashboard();

    } else if (currentView === 'heatmap' && typeof renderHeatmap === 'function') {
      renderHeatmap();

    } else if (currentView === 'rubric' && typeof renderRubric === 'function') {
      renderRubric();

    } else if (currentView === 'export' && typeof renderExport === 'function') {
      renderExport();

    } else if (currentView === 'teacherprofile' && typeof renderTeacherProfile === 'function') {
      renderTeacherProfile();

    } else if (currentView === 'mysubmissions' && typeof renderMySubmissions === 'function') {
      renderMySubmissions();

    } else if (currentView === 'calendar' && typeof renderCalendar === 'function') {
      renderCalendar();

    } else if (currentView === 'profile' && typeof renderProfile === 'function') {
      renderProfile();

    } else {
      content.innerHTML = `
        <div class="text-center py-12">
          <p class="text-red-500 font-medium">
            ไม่พบหน้าที่เรียก: ${currentView}
          </p>
        </div>
      `;
    }

  } catch (err) {
    console.error('renderCurrentView error:', err);
    content.innerHTML = `
      <div class="text-center py-12">
        <p class="text-red-500 font-medium">
          เกิดข้อผิดพลาดในการแสดงหน้า
        </p>
      </div>
    `;
  }
}

function updateUserDisplay() {
  if (!currentUser) return;

  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  const avatarEl   = document.getElementById('userAvatar');

  // 🛡️ กัน element ยังไม่อยู่ใน DOM
  if (!userNameEl || !userRoleEl || !avatarEl) {
    console.warn('⚠️ user display elements not ready');
    return;
  }

  // ---------- ชื่อ ----------
  userNameEl.textContent =
    `${currentUser.name || ''} ${currentUser.surname || ''}`.trim();

  // ---------- บทบาท ----------
  userRoleEl.textContent =
    currentUser.role === 'teacher'
      ? 'อาจารย์'
      : `นักเรียน เลขที่ ${currentUser.student_number || '-'}`;

  // ---------- Avatar ----------
  if (currentUser.avatar) {
    avatarEl.innerHTML = `
      <img src="${currentUser.avatar}"
           class="w-full h-full rounded-full object-cover">
    `;
  } else {
    avatarEl.textContent =
      (currentUser.name || '?').charAt(0).toUpperCase();
  }
}
 
    function hideNotification() {
      document.getElementById('notificationBanner').classList.add('hidden');
    }
    
function goToProfile() {
  if (!currentUser) return;

  currentView =
    currentUser.role === 'teacher'
      ? 'teacherprofile'
      : 'profile';

  switchView(currentView); // ⭐ ใช้เส้นหลัก
}

  function renderReuseAssignments() {
  const content = document.getElementById('mainContent');
    if (!currentUser || currentUser.role !== 'teacher') {
    content.innerHTML = `
      <p class="text-center text-red-500">ไม่มีสิทธิ์เข้าหน้านี้</p>
    `;
    return;
  }
  const myAssignments = allData.filter(
    d => d.type === 'assignment' && d.teacher_email === currentUser.email
  );
  if (myAssignments.length === 0) {
  content.innerHTML = `
    <p class="text-center text-sub">ยังไม่มีงานให้ใช้ซ้ำ</p>
  `;
  return;
}
  content.innerHTML = `
    <h2 class="text-xl font-bold mb-4">📋 เลือกงานที่ต้องการใช้ซ้ำ</h2>
    <div class="space-y-3">
      ${myAssignments.map(a => `
        <div class="card-bg p-4 rounded-xl flex justify-between items-center">
          <div>
            <p class="font-medium">${a.title}</p>
            <p class="text-xs text-sub">${a.subject}</p>
          </div>
          <button
            onclick="reuseAssignment('${a.__backendId}')"
            class="accent-bg text-white px-3 py-1 rounded-lg text-xs"
          >
            ใช้งานนี้
          </button>
        </div>
      `).join('')}
    </div>
  `;
}
// ================== EXPORT UI FUNCTIONS ==================
// ===== App Core =====
window.showmainApp = showmainApp;
window.hideAllModals = hideAllModals;

// ===== Auth / Modal =====
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;

window.showHelpModal = showHelpModal;
window.hideHelpModal = hideHelpModal;

window.showSuccessModal = showSuccessModal;
window.hideSuccessModal = hideSuccessModal;

window.showLogoutModal = showLogoutModal;
window.hideLogoutModal = hideLogoutModal;
window.confirmLogout = confirmLogout;

// ===== Navigation / UI =====
window.switchView = switchView;
window.changeTheme = changeTheme;
window.goToProfile = goToProfile;

// ===== Sidebar / Render =====
window.renderSidebar = renderSidebar;
window.renderCurrentView = renderCurrentView;
window.entermainApp = entermainApp;
window.showLandingPage = showLandingPage;

// ===== Assignments =====
window.renderAssignments = renderAssignments;
window.showSubmitModal = showSubmitModal;
window.hideSubmitModal = hideSubmitModal;
window.handleSubmitAssignment = handleSubmitAssignment;

window.renderCreateAssignment = renderCreateAssignment;
window.handleCreateAssignment = handleCreateAssignment;

window.reuseAssignment = reuseAssignment;

// ===== Submission Files =====
window.handleAddSubmitFiles = handleAddSubmitFiles;
window.removeSubmitFile = removeSubmitFile;

// ===== Teacher =====
window.gradeSubmission = gradeSubmission;
window.renderStudents = renderStudents;
window.deleteStudent = deleteStudent;

window.renderDashboard = renderDashboard;
window.renderHeatmap = renderHeatmap;
window.renderRubric = renderRubric;
window.renderExport = renderExport;
window.renderTeacherProfile = renderTeacherProfile;
window.updateTeacherProfile = updateTeacherProfile;

// ===== Student =====
window.renderMySubmissions = renderMySubmissions;
window.renderCalendar = renderCalendar;
window.renderProfile = renderProfile;
window.updateProfile = updateProfile;

// ===== Avatar =====
window.uploadAvatar = uploadAvatar;

// ⭐ AUTH (ที่ขาดอยู่)
window.showLoginForm = showLoginForm;
window.showSignupForm = showSignupForm;
window.verifyOTP = verifyOTP;
window.resendOTP = resendOTP;
